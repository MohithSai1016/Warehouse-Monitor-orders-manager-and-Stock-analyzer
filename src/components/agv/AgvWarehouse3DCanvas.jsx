/**
 * AgvWarehouse3DCanvas — 3D Interactive Warehouse with Elevation-Based Dedicated Tracks (Zero Traffic System)
 *
 * Visual & Mechanical Features:
 *   - Multi-Level Warehouse: Upper Elevated Steel Deck (Y=46) + Ground Guideway Floor (Y=1.2)
 *   - Heavy Structural Steel I-Beams & Vertical Support Columns
 *   - 2-Tier Modular Storage Racks (A1..F1 Upper, A2..F2 Lower) with Cargo Boxes & 3D Billboards
 *   - 10 Dedicated Glowing Multi-Level Track Rails (Zero Collisions, Zero Stops, 100% Continuous Flow)
 *   - Integrated HUD: Fleet Overview, Depot Bays, Courier Docks, Fast Charging Docks
 *   - Dynamic Camera Controls: 3D Orbit, Top-Down Plan, Follow Selected AMR, Depot View
 *   - Rock-Solid React 18/19 & WebGL lifecycle with automatic fallback safety
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MAP_CONFIG } from '../../engine/agvSimulationEngine';
import { 
  TRACK_COLORS, 
  ROBOT_TRACK_CONFIG, 
  generateAll3DTrackVisuals 
} from '../../engine/agv3dTrackEngine';
import { 
  Camera, 
  Compass, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Layers,
  Truck,
  Box as BoxIcon,
  AlertTriangle
} from 'lucide-react';

function mapTo3D(x, y) {
  const worldX = ((x || 0) - MAP_CONFIG.width / 2) * 0.95;
  const worldZ = ((y || 0) - MAP_CONFIG.height / 2) * 0.95;
  return { x: worldX, z: worldZ };
}

export function AgvWarehouse3DCanvas({
  fleet = [],
  selectedAgvId = 'AGV-03',
  onSelectAgv = () => {},
  showPaths = true,
  showHeatmap = false,
  heatmapGrid,
  showTaskLabels = true,
  showRackIds = true,
  showChargingStations = true
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const robotMeshesRef = useRef(new Map());
  const [webglError, setWebglError] = useState(null);

  const controlsStateRef = useRef({
    isDragging: false,
    isRightDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    cameraAngleH: Math.PI / 3.8,   // ~47 deg azimuth
    cameraAngleV: Math.PI / 4.2,   // ~42 deg elevation
    cameraDistance: 640,
    cameraTarget: new THREE.Vector3(0, 20, 0)
  });

  const [cameraViewMode, setCameraViewMode] = useState('ISOMETRIC');

  const applyCameraPreset = (mode) => {
    setCameraViewMode(mode);
    const ctrl = controlsStateRef.current;
    if (mode === 'ISOMETRIC') {
      ctrl.cameraAngleH = Math.PI / 3.8;
      ctrl.cameraAngleV = Math.PI / 4.2;
      ctrl.cameraDistance = 640;
      ctrl.cameraTarget.set(0, 20, 0);
    } else if (mode === 'TOP') {
      ctrl.cameraAngleH = 0;
      ctrl.cameraAngleV = Math.PI / 2.02;
      ctrl.cameraDistance = 700;
      ctrl.cameraTarget.set(0, 20, 0);
    } else if (mode === 'DEPOT') {
      ctrl.cameraAngleH = -Math.PI / 3.2;
      ctrl.cameraAngleV = Math.PI / 5.5;
      ctrl.cameraDistance = 420;
      const d3d = mapTo3D(MAP_CONFIG.depotArea.x + 120, MAP_CONFIG.depotArea.y + 60);
      ctrl.cameraTarget.set(d3d.x, 15, d3d.z);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    robotMeshesRef.current.clear();

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 580;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      console.error('WebGL initialization failed:', err);
      setWebglError(err.message || 'WebGL not supported');
      return;
    }

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070b14');
    scene.fog = new THREE.FogExp2('#070b14', 0.0008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(44, width / height, 1, 3500);
    cameraRef.current = camera;

    // 3. Renderer Settings
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#e0e7ff', 1.5);
    dirLight.position.set(300, 500, 250);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    const blueRimLight = new THREE.DirectionalLight('#38bdf8', 0.7);
    blueRimLight.position.set(-350, 250, -250);
    scene.add(blueRimLight);

    // 5. Floor & Factory Base
    const floorGeo = new THREE.PlaneGeometry(1300, 950);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0c1322',
      roughness: 0.85,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(1300, 65, '#1e293b', '#111827');
    gridHelper.position.y = 0.15;
    scene.add(gridHelper);

    // 6. Multi-Level Structural Steel Support Framework (Elevated Deck at Y = 46)
    const steelMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });
    const beamGeoX = new THREE.BoxGeometry(920 * 0.95, 3.5, 4.5);
    const beamGeoZ = new THREE.BoxGeometry(4.5, 3.5, 520 * 0.95);
    const colGeo = new THREE.BoxGeometry(4.5, 46, 4.5);

    // Horizontal Steel Girders for Upper Deck
    [-130, 0, 130].forEach(pz => {
      const girder = new THREE.Mesh(beamGeoX, steelMat);
      girder.position.set(0, 44, pz);
      girder.castShadow = true;
      girder.receiveShadow = true;
      scene.add(girder);
    });

    [-380, -190, 0, 190, 380].forEach(px => {
      const girderZ = new THREE.Mesh(beamGeoZ, steelMat);
      girderZ.position.set(px, 44, 0);
      girderZ.castShadow = true;
      scene.add(girderZ);

      // Support Vertical Columns
      [-130, 130].forEach(pz => {
        const column = new THREE.Mesh(colGeo, steelMat);
        column.position.set(px, 23, pz);
        column.castShadow = true;
        column.receiveShadow = true;
        scene.add(column);
      });
    });

    // 7. 2-Tier 3D Modular Storage Racks (Upper Tier Racks A1..F1, Lower Tier Racks A2..F2)
    MAP_CONFIG.racks.forEach((rack) => {
      const rackGroup = new THREE.Group();
      const pos3D = mapTo3D(rack.x + rack.width / 2, rack.y + rack.height / 2);
      rackGroup.position.set(pos3D.x, 0, pos3D.z);

      const isUpperRack = rack.id.endsWith('1');
      const baseY = isUpperRack ? 46 : 0;
      const rW = rack.width * 0.86;
      const rD = rack.height * 0.86;
      const rH = 38;

      // 4 Steel Corner Frame Uprights
      const postGeo = new THREE.BoxGeometry(2.2, rH, 2.2);
      const postMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.6, roughness: 0.4 });
      [
        [-rW / 2 + 1.1, -rD / 2 + 1.1],
        [rW / 2 - 1.1, -rD / 2 + 1.1],
        [-rW / 2 + 1.1, rD / 2 - 1.1],
        [rW / 2 - 1.1, rD / 2 - 1.1]
      ].forEach(([px, pz]) => {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, baseY + rH / 2, pz);
        post.castShadow = true;
        rackGroup.add(post);
      });

      // 2 Shelves with Pallets & Zone-Colored Boxes
      const shelfMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.5, roughness: 0.5 });
      const palletMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
      const boxMat = new THREE.MeshStandardMaterial({ color: rack.color || '#38bdf8', roughness: 0.6 });

      [10, 24].forEach((sY) => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(rW, 1.6, rD), shelfMat);
        beam.position.set(0, baseY + sY, 0);
        beam.castShadow = true;
        rackGroup.add(beam);

        // Pallets & Boxes
        for (let bx = -1; bx <= 1; bx++) {
          for (let bz = -0.5; bz <= 0.5; bz += 1) {
            const posX = bx * (rW / 3.4);
            const posZ = bz * (rD / 2.5);

            const pallet = new THREE.Mesh(new THREE.BoxGeometry(rW / 3.8, 1.2, rD / 2.6), palletMat);
            pallet.position.set(posX, baseY + sY + 1.4, posZ);
            pallet.castShadow = true;
            rackGroup.add(pallet);

            const box = new THREE.Mesh(new THREE.BoxGeometry(rW / 4.2, 7.5, rD / 3.0), boxMat);
            box.position.set(posX, baseY + sY + 6.0, posZ);
            box.castShadow = true;
            rackGroup.add(box);
          }
        }
      });

      // Rack Header ID Billboard
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 70;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 256, 70);
          ctx.strokeStyle = rack.color || '#38bdf8';
          ctx.lineWidth = 4;
          ctx.strokeRect(4, 4, 248, 62);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(rack.id, 128, 35);

          const texture = new THREE.CanvasTexture(canvas);
          const tagMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
          const tagMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 7.6), tagMat);
          tagMesh.position.set(0, baseY + rH + 5, 0);
          rackGroup.add(tagMesh);
        }
      } catch (e) {
        // Fallback without canvas texture
      }

      scene.add(rackGroup);
    });

    // 8. 10 Dedicated Multi-Level Symmetrical Glowing Track Rails & Floor Laser Lines
    const allTracks = generateAll3DTrackVisuals();

    // Structural stanchion material for elevated bridge tracks
    const stanchionMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.8,
      roughness: 0.3
    });

    allTracks.forEach(track => {
      const points = track.points.map(pt => {
        const pt3D = mapTo3D(pt.x, pt.y);
        return new THREE.Vector3(pt3D.x, track.height, pt3D.z);
      });

      const floorPoints = track.points.map(pt => {
        const pt3D = mapTo3D(pt.x, pt.y);
        return new THREE.Vector3(pt3D.x, 0.4, pt3D.z);
      });

      if (points.length >= 2) {
        try {
          // A. 3D Glowing Track Tube Rail
          const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.15);
          const tubeGeo = new THREE.TubeGeometry(curve, 160, 0.95, 8, true);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: track.color,
            emissive: track.color,
            emissiveIntensity: 0.85,
            roughness: 0.15,
            metalness: 0.85
          });
          const tube = new THREE.Mesh(tubeGeo, tubeMat);
          tube.castShadow = true;
          scene.add(tube);

          // B. Symmetrical Floor Guideway Laser Line
          const floorCurve = new THREE.CatmullRomCurve3(floorPoints, true, 'centripetal', 0.15);
          const floorLineGeo = new THREE.BufferGeometry().setFromPoints(floorCurve.getPoints(120));
          const floorLineMat = new THREE.LineBasicMaterial({
            color: track.color,
            transparent: true,
            opacity: 0.35,
            linewidth: 2
          });
          const floorLine = new THREE.Line(floorLineGeo, floorLineMat);
          scene.add(floorLine);

          // C. Symmetrical Vertical Girder Support Stanchions (For Upper Elevated Level)
          if (track.level === 'UPPER') {
            points.forEach((pt, pIdx) => {
              if (pIdx % 3 === 0) {
                const pillarGeo = new THREE.CylinderGeometry(0.55, 0.75, track.height, 8);
                const pillar = new THREE.Mesh(pillarGeo, stanchionMat);
                pillar.position.set(pt.x, track.height / 2, pt.z);
                pillar.castShadow = true;
                scene.add(pillar);

                // Base foot pad
                const footPad = new THREE.Mesh(
                  new THREE.BoxGeometry(2.4, 0.6, 2.4),
                  new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9 })
                );
                footPad.position.set(pt.x, 0.3, pt.z);
                scene.add(footPad);
              }
            });
          }
        } catch (e) {
          // Fallback line
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color: track.color });
          scene.add(new THREE.Line(lineGeo, lineMat));
        }
      }
    });

    // 9. WEST SIDE WING: AUTOMATED PACKAGING & TAPING FACILITY
    const westPackingX = -395;
    const westPackingZ = -30;
    const packingRoomGroup = new THREE.Group();
    packingRoomGroup.position.set(westPackingX, 0, westPackingZ);

    const roomW = 150;
    const roomD = 230;
    const roomH = 34;

    // A. Epoxy Facility Floor with Hazard Border
    const roomFloor = new THREE.Mesh(
      new THREE.BoxGeometry(roomW, 2.2, roomD),
      new THREE.MeshStandardMaterial({ color: '#09111e', roughness: 0.35, metalness: 0.6 })
    );
    roomFloor.position.y = 1.1;
    roomFloor.receiveShadow = true;
    packingRoomGroup.add(roomFloor);

    // Hazard perimeter line
    const hazardBorder = new THREE.Mesh(
      new THREE.BoxGeometry(roomW + 2, 0.4, roomD + 2),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#d97706', emissiveIntensity: 0.35 })
    );
    hazardBorder.position.y = 2.4;
    packingRoomGroup.add(hazardBorder);

    // B. High-Tech Glass & Steel Enclosure Walls
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.9
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.85, roughness: 0.25 });

    // West Side Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(2.5, roomH, roomD), glassMat);
    backWall.position.set(-roomW / 2, roomH / 2 + 1, 0);
    packingRoomGroup.add(backWall);

    // North Wall of West Room
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 2.5), glassMat);
    northWall.position.set(0, roomH / 2 + 1, -roomD / 2);
    packingRoomGroup.add(northWall);

    // C. 3D Illuminated Header Billboard ("WEST WING: AUTOMATED PACKING FACILITY")
    try {
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 80;
      const sctx = signCanvas.getContext('2d');
      if (sctx) {
        sctx.fillStyle = '#030712';
        sctx.fillRect(0, 0, 512, 80);
        sctx.strokeStyle = '#38bdf8';
        sctx.lineWidth = 4;
        sctx.strokeRect(4, 4, 504, 72);
        sctx.fillStyle = '#38bdf8';
        sctx.font = 'bold 24px sans-serif';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText('⚡ WEST WING: AUTOMATED PACKING FACILITY', 256, 40);

        const signTex = new THREE.CanvasTexture(signCanvas);
        const signMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(roomW * 0.9, 7.5),
          new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide })
        );
        signMesh.position.set(0, roomH + 4, roomD / 2);
        packingRoomGroup.add(signMesh);
      }
    } catch (e) {}

    // D. 5 Automated Packing Benches & Robotic Packaging Cells
    const benchMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.7 });
    const kukaOrangeMat = new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#c2410c', emissiveIntensity: 0.25, metalness: 0.8 });

    for (let b = 0; b < 5; b++) {
      const bZ = (b - 2) * (roomD * 0.18);
      const benchGroup = new THREE.Group();
      benchGroup.position.set(0, 2.2, bZ);

      // Packing Workbench Table
      const benchTable = new THREE.Mesh(new THREE.BoxGeometry(20, 6.0, 18), benchMat);
      benchTable.position.y = 3.0;
      benchTable.castShadow = true;
      benchGroup.add(benchTable);

      // Digital Weighing Scale & Display Screen
      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(5.0, 4.0, 1.2),
        new THREE.MeshStandardMaterial({ color: '#030712', emissive: '#38bdf8', emissiveIntensity: 0.6 })
      );
      monitor.position.set(0, 8.5, 6.5);
      benchGroup.add(monitor);

      // Taping / Carton Hopper Machine
      const hopper = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 8.0, 5.0),
        new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.8, roughness: 0.2 })
      );
      hopper.position.set(-6.5, 7.5, -3.5);
      benchGroup.add(hopper);

      // Articulated Packaging Robot Arm
      if (b === 1 || b === 3) {
        const armBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 3.2, 12), kukaOrangeMat);
        armBase.position.set(5.5, 7.5, -2.5);
        benchGroup.add(armBase);

        const armUpper = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 2.0), kukaOrangeMat);
        armUpper.position.set(5.5, 11.5, -1.0);
        armUpper.rotation.z = -0.35;
        benchGroup.add(armUpper);
      }

      packingRoomGroup.add(benchGroup);
    }

    // E. Optical Scanner Arch with Laser Curtain
    const scannerArch = new THREE.Mesh(
      new THREE.BoxGeometry(20.0, 14.0, roomD * 0.85),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9 })
    );
    scannerArch.position.set(25, 10, 0);
    packingRoomGroup.add(scannerArch);

    // Glowing Laser Scanning Beam Line
    const laserBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, roomD * 0.8),
      new THREE.MeshBasicMaterial({ color: '#ef4444' })
    );
    laserBeam.position.set(25, 7.5, 0);
    packingRoomGroup.add(laserBeam);

    scene.add(packingRoomGroup);

    // 10. MOTORIZED ROLLER CONVEYOR BRIDGE (Linking West Packing Wing -> South Picking Platform)
    const frontPlatformX = -40;
    const frontPlatformZ = 290;
    const conveyorY = 7.5;

    // Conveyor curve from West Packing Facility to South Front Picking Platform (Extended buffer distance from AMR tracks)
    const conveyorCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(westPackingX + 40, conveyorY, westPackingZ),
      new THREE.Vector3((westPackingX + frontPlatformX) / 1.5, conveyorY, (westPackingZ + frontPlatformZ) / 2),
      new THREE.Vector3(frontPlatformX, conveyorY, frontPlatformZ - 20)
    ]);

    const conveyorGeo = new THREE.TubeGeometry(conveyorCurve, 50, 6.5, 8, false);
    const conveyorMat = new THREE.MeshStandardMaterial({ color: '#0b0f19', roughness: 0.8, metalness: 0.4 });
    const conveyorMesh = new THREE.Mesh(conveyorGeo, conveyorMat);
    scene.add(conveyorMesh);

    // Conveyor Shiny Guide Rails
    [-5.5, 5.5].forEach(offset => {
      const railCurve = new THREE.CatmullRomCurve3(conveyorCurve.getPoints(20).map(p => new THREE.Vector3(p.x + offset, p.y + 2.2, p.z)));
      const railGeo = new THREE.TubeGeometry(railCurve, 30, 0.6, 6, false);
      const railMesh = new THREE.Mesh(railGeo, new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.5, metalness: 0.9 }));
      scene.add(railMesh);
    });

    // Conveyor Vertical Legs
    conveyorCurve.getPoints(6).forEach((pt, pIdx) => {
      if (pIdx > 0 && pIdx < 6) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, pt.y, 8), frameMat);
        leg.position.set(pt.x, pt.y / 2, pt.z);
        leg.castShadow = true;
        scene.add(leg);
      }
    });

    // 11. SOUTH FRONT: ELEVATED PICKING & TAKEAWAY STAGING PLATFORM
    const pickPlatformGroup = new THREE.Group();
    pickPlatformGroup.position.set(frontPlatformX, 0, frontPlatformZ);

    const platformW = 160;
    const platformD = 90;

    const pickBase = new THREE.Mesh(
      new THREE.BoxGeometry(platformW, 5.0, platformD),
      new THREE.MeshStandardMaterial({ color: '#0c1020', roughness: 0.45, metalness: 0.7 })
    );
    pickBase.position.y = 2.5;
    pickBase.receiveShadow = true;
    pickPlatformGroup.add(pickBase);

    // Safety Perimeter Glowing Railing
    const safetyRail = new THREE.Mesh(
      new THREE.BoxGeometry(platformW + 2, 3.8, platformD + 2),
      new THREE.MeshStandardMaterial({ color: '#4f46e5', emissive: '#3730a3', emissiveIntensity: 0.45, transparent: true, opacity: 0.35 })
    );
    safetyRail.position.y = 6.8;
    pickPlatformGroup.add(safetyRail);

    // South Billboard ("SOUTH FRONT: OUTBOUND PICKING & TAKEAWAY PLATFORM")
    try {
      const southCanvas = document.createElement('canvas');
      southCanvas.width = 512;
      southCanvas.height = 72;
      const sctx = southCanvas.getContext('2d');
      if (sctx) {
        sctx.fillStyle = '#030712';
        sctx.fillRect(0, 0, 512, 72);
        sctx.strokeStyle = '#6366f1';
        sctx.lineWidth = 4;
        sctx.strokeRect(3, 3, 506, 66);
        sctx.fillStyle = '#818cf8';
        sctx.font = 'bold 22px sans-serif';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText('🚚 SOUTH FRONT: PICKING & TAKEAWAY HUB', 256, 36);

        const sTex = new THREE.CanvasTexture(southCanvas);
        const sMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(platformW * 0.85, 8.5),
          new THREE.MeshBasicMaterial({ map: sTex, transparent: true, side: THREE.DoubleSide })
        );
        sMesh.position.set(0, 16.0, -platformD / 2);
        pickPlatformGroup.add(sMesh);
      }
    } catch (e) {}

    // Staging Pallets & Delivery Package Stacks on Platform
    const palletWoodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const parcelKraftMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.6 });
    const polybagWhiteMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, metalness: 0.1 });

    [-50, 0, 50].forEach((px) => {
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(26, 1.8, 26), palletWoodMat);
      pallet.position.set(px, 5.8, 0);
      pickPlatformGroup.add(pallet);

      const box1 = new THREE.Mesh(new THREE.BoxGeometry(9, 7.0, 9), parcelKraftMat);
      box1.position.set(px - 3, 10.0, -2);
      box1.castShadow = true;
      pickPlatformGroup.add(box1);

      const bag1 = new THREE.Mesh(new THREE.BoxGeometry(8, 4.0, 8), polybagWhiteMat);
      bag1.position.set(px + 4, 8.6, 3);
      bag1.castShadow = true;
      pickPlatformGroup.add(bag1);
    });

    scene.add(pickPlatformGroup);

    // North Storage Aisle Billboard
    try {
      const northCanvas = document.createElement('canvas');
      northCanvas.width = 512;
      northCanvas.height = 72;
      const nctx = northCanvas.getContext('2d');
      if (nctx) {
        nctx.fillStyle = '#030712';
        nctx.fillRect(0, 0, 512, 72);
        nctx.strokeStyle = '#10b981';
        nctx.lineWidth = 4;
        nctx.strokeRect(3, 3, 506, 66);
        nctx.fillStyle = '#34d399';
        nctx.font = 'bold 22px sans-serif';
        nctx.textAlign = 'center';
        nctx.textBaseline = 'middle';
        nctx.fillText('📦 NORTH WING: STORAGE & RACK AISLES', 256, 36);

        const nTex = new THREE.CanvasTexture(northCanvas);
        const nMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(160, 9.5),
          new THREE.MeshBasicMaterial({ map: nTex, transparent: true, side: THREE.DoubleSide })
        );
        nMesh.position.set(0, 48, -180);
        scene.add(nMesh);
      }
    } catch (e) {}

    // 12. 2 LARGE LOGISTICS FREIGHT TRUCKS (At Inbound & Outbound Docks)
    function createLogisticsTruck({ x, z, angle = 0, color = '#1e3a8a', label = 'EXPRESS FREIGHT' }) {
      const truckGroup = new THREE.Group();
      truckGroup.position.set(x, 0, z);
      truckGroup.rotation.y = angle;

      const truckCabMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.25 });
      const containerMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.6, roughness: 0.4 });
      const truckWheelMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.4 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.1 });

      // Cargo Container Trailer Body
      const trailer = new THREE.Mesh(new THREE.BoxGeometry(54, 22, 20), containerMat);
      trailer.position.set(-10, 15, 0);
      trailer.castShadow = true;
      truckGroup.add(trailer);

      // Open Rear Tailgate Cargo Interior (Pallets & Boxes inside)
      const interiorPallet = new THREE.Mesh(new THREE.BoxGeometry(16, 1.6, 14), palletWoodMat);
      interiorPallet.position.set(12, 5.0, 0);
      truckGroup.add(interiorPallet);

      const interiorBox = new THREE.Mesh(new THREE.BoxGeometry(7.5, 6.0, 6.5), parcelKraftMat);
      interiorBox.position.set(12, 8.8, 0);
      interiorBox.castShadow = true;
      truckGroup.add(interiorBox);

      // Driver Cab
      const cab = new THREE.Mesh(new THREE.BoxGeometry(22, 19, 19), truckCabMat);
      cab.position.set(-45, 13.5, 0);
      cab.castShadow = true;
      truckGroup.add(cab);

      // Windshield Glass
      const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 8.0, 16),
        new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.4, roughness: 0.1 })
      );
      windshield.position.set(-56.2, 16.5, 0);
      truckGroup.add(windshield);

      // Chrome Front Grille & Headlights
      const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.0, 14), chromeMat);
      grille.position.set(-56.2, 8.5, 0);
      truckGroup.add(grille);

      [-6.0, 6.0].forEach((ly) => {
        const headlight = new THREE.Mesh(
          new THREE.SphereGeometry(1.4, 8, 8),
          new THREE.MeshBasicMaterial({ color: '#fef08a' })
        );
        headlight.position.set(-56.5, 8.5, ly);
        truckGroup.add(headlight);
      });

      // Heavy 18-Wheeler Wheels (6 Dual Wheel Sets)
      [-48, -38, -20, -5, 8, 14].forEach((wx) => {
        [-9.8, 9.8].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 2.2, 16), truckWheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 4.2, wz);
          wheel.castShadow = true;
          truckGroup.add(wheel);
        });
      });

      // Side Container Decal Billboard
      try {
        const tCanvas = document.createElement('canvas');
        tCanvas.width = 256;
        tCanvas.height = 64;
        const tctx = tCanvas.getContext('2d');
        if (tctx) {
          tctx.fillStyle = '#0f172a';
          tctx.fillRect(0, 0, 256, 64);
          tctx.strokeStyle = '#38bdf8';
          tctx.lineWidth = 3;
          tctx.strokeRect(2, 2, 252, 60);
          tctx.fillStyle = '#ffffff';
          tctx.font = 'bold 20px sans-serif';
          tctx.textAlign = 'center';
          tctx.textBaseline = 'middle';
          tctx.fillText(label, 128, 32);

          const tTex = new THREE.CanvasTexture(tCanvas);
          const tMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(36, 9),
            new THREE.MeshBasicMaterial({ map: tTex, transparent: true, side: THREE.DoubleSide })
          );
          tMesh.position.set(-10, 15, 10.2);
          truckGroup.add(tMesh);
        }
      } catch (e) {}

      return truckGroup;
    }

    // Truck 1: Inbound Replenishment Freight (Dock 1)
    const truck1 = createLogisticsTruck({ x: frontPlatformX - 140, z: frontPlatformZ + 12, angle: Math.PI / 2, color: '#0369a1', label: 'INBOUND SUPPLY 01' });
    scene.add(truck1);

    // Truck 2: Outbound Regional Dispatch Freight (Dock 2)
    const truck2 = createLogisticsTruck({ x: frontPlatformX + 140, z: frontPlatformZ + 12, angle: Math.PI / 2, color: '#1e3a8a', label: 'EXPRESS DISPATCH 02' });
    scene.add(truck2);

    // 13. WEST PACKING ROOM ASPHALT ROAD & PARKED DELIVERY MOTORBIKES
    const westRoadX = westPackingX - 95;
    const westRoadGroup = new THREE.Group();
    westRoadGroup.position.set(westRoadX, 0, westPackingZ);

    // Asphalt Road Surface running along West Packing Room
    const westRoadSurface = new THREE.Mesh(
      new THREE.BoxGeometry(60, 1.0, 260),
      new THREE.MeshStandardMaterial({ color: '#181e2b', roughness: 0.9 })
    );
    westRoadSurface.position.y = 0.5;
    westRoadSurface.receiveShadow = true;
    westRoadGroup.add(westRoadSurface);

    // Sidewalk Curb between Road and Packing Room
    const westCurb = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 1.8, 260),
      new THREE.MeshStandardMaterial({ color: '#eab308', emissive: '#ca8a04', emissiveIntensity: 0.3 })
    );
    westCurb.position.set(28, 0.9, 0);
    westRoadGroup.add(westCurb);

    // White Dashed Center Lane Markings
    for (let rz = -110; rz <= 110; rz += 35) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 18),
        new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 1.02, rz);
      westRoadGroup.add(dash);
    }

    // Street Light Poles along West Road
    [-90, 0, 90].forEach((sz) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 38, 8), frameMat);
      pole.position.set(26, 19, sz);
      westRoadGroup.add(pole);

      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 1.5, 6.0),
        new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: '#fef08a', emissiveIntensity: 0.9 })
      );
      lampHead.position.set(22, 37, sz);
      westRoadGroup.add(lampHead);
    });

    // 4 Delivery Motorbikes Parked Outside Packing Room
    const bikeWheelMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });
    const bikeFrameMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.8, roughness: 0.2 });
    const bikeChromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.1 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#0369a1', emissive: '#0284c7', emissiveIntensity: 0.35, roughness: 0.4 });

    [-65, -20, 25, 70].forEach((bz, bIdx) => {
      const bikeGroup = new THREE.Group();
      bikeGroup.position.set(16, 0, bz);
      bikeGroup.rotation.y = -Math.PI / 2;

      // Front & Rear Rubber Wheels
      [-6.5, 6.5].forEach((wx) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.2, 16), bikeWheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 2.8, 0);
        wheel.castShadow = true;
        bikeGroup.add(wheel);
      });

      // Bike Chassis / Body
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(9.0, 3.8, 2.4), bikeFrameMat);
      chassis.position.set(0, 4.2, 0);
      chassis.castShadow = true;
      bikeGroup.add(chassis);

      // Handlebars & Headlight
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5.5, 8), bikeChromeMat);
      fork.position.set(5.5, 5.8, 0);
      fork.rotation.z = -0.25;
      bikeGroup.add(fork);

      const headlight = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#fef08a' })
      );
      headlight.position.set(7.2, 6.8, 0);
      bikeGroup.add(headlight);

      // Seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 2.2), new THREE.MeshStandardMaterial({ color: '#090d16' }));
      seat.position.set(-1.0, 6.2, 0);
      bikeGroup.add(seat);

      // Delivery Carrier Trunk Box on Back
      const trunk = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6.2, 5.0), trunkMat);
      trunk.position.set(-5.5, 8.2, 0);
      trunk.castShadow = true;
      bikeGroup.add(trunk);

      westRoadGroup.add(bikeGroup);
    });

    scene.add(westRoadGroup);

    // 14. 3D ANIMATED HUMANOID FIGURES (Packers & Delivery Couriers)
    const skinMat = new THREE.MeshStandardMaterial({ color: '#d4a373', roughness: 0.5 });
    const vestMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 });
    const riderVestMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.4 });
    const putawayVestMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.4 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: '#ef4444', metalness: 0.8, roughness: 0.2 });

    function createHumanFigure({ isRider = false, isPutaway = false, hasBox = true, angle = 0, name = 'human' }) {
      const hGroup = new THREE.Group();
      hGroup.name = name;
      
      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 12), skinMat);
      head.position.y = 14.8;
      head.name = 'head';
      hGroup.add(head);

      // Helmet / Cap
      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(1.65, 12, 12), 
        isRider ? helmetMat : new THREE.MeshStandardMaterial({ color: isPutaway ? '#10b981' : '#38bdf8' })
      );
      helmet.position.set(0, 15.2, -0.1);
      hGroup.add(helmet);

      // Torso / High-Vis Vest
      const torsoMat = isRider ? riderVestMat : (isPutaway ? putawayVestMat : vestMat);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5.2, 2.2), torsoMat);
      torso.position.y = 11.2;
      torso.castShadow = true;
      hGroup.add(torso);

      // Reflective Neon Strip
      const strip = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 2.3), new THREE.MeshBasicMaterial({ color: '#fef08a' }));
      strip.position.y = 11.2;
      hGroup.add(strip);

      // Left & Right Arms
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.2, 0.9), skinMat);
      leftArm.position.set(-2.1, 11.0, hasBox ? 1.0 : 0);
      leftArm.rotation.x = hasBox ? -Math.PI / 3.5 : 0;
      leftArm.name = 'leftArm';
      hGroup.add(leftArm);

      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.2, 0.9), skinMat);
      rightArm.position.set(2.1, 11.0, hasBox ? 1.0 : 0);
      rightArm.rotation.x = hasBox ? -Math.PI / 3.5 : 0;
      rightArm.name = 'rightArm';
      hGroup.add(rightArm);

      // Left & Right Legs
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.2, 1.2), pantsMat);
      leftLeg.position.set(-1.0, 5.6, 0);
      leftLeg.castShadow = true;
      leftLeg.name = 'leftLeg';
      hGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.2, 1.2), pantsMat);
      rightLeg.position.set(1.0, 5.6, 0);
      rightLeg.castShadow = true;
      rightLeg.name = 'rightLeg';
      hGroup.add(rightLeg);

      // Carried Carton / Delivery Bag
      if (hasBox) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 3.2, 3.6),
          isRider ? polybagWhiteMat : parcelKraftMat
        );
        box.position.set(0, 10.6, 2.8);
        box.castShadow = true;
        box.name = 'carriedBox';
        hGroup.add(box);
      }

      hGroup.rotation.y = angle;
      return hGroup;
    }

    // 1. Walking Delivery Courier (Animates back and forth between Packing Room and Parked Bikes)
    const walkerCourier = createHumanFigure({ isRider: true, hasBox: true, angle: -Math.PI / 2, name: 'walkerCourier' });
    walkerCourier.position.set(westPackingX - 50, 0, westPackingZ - 20);
    scene.add(walkerCourier);

    // 2. Rider Loading Delivery Motorbike outside Packing Room
    const riderLoading = createHumanFigure({ isRider: true, hasBox: false, angle: Math.PI / 2, name: 'riderLoading' });
    riderLoading.position.set(westRoadX + 16, 0, westPackingZ + 25);
    scene.add(riderLoading);

    // 3. Active Packing Operator at Workbench (Arms moving/taping)
    const activePacker = createHumanFigure({ isPutaway: false, hasBox: true, angle: 0, name: 'activePacker' });
    activePacker.position.set(westPackingX - 25, 2.2, westPackingZ - 40);
    scene.add(activePacker);

    // 4. Packing Facility Quality Inspector / Supervisor
    const packingSupervisor = createHumanFigure({ isPutaway: false, hasBox: false, angle: -Math.PI / 3, name: 'packingSupervisor' });
    packingSupervisor.position.set(westPackingX + 35, 2.2, westPackingZ + 15);
    scene.add(packingSupervisor);

    // 5. Walking Picker at South Picking Platform (Carrying Boxes across platform)
    const platformPicker = createHumanFigure({ isPutaway: true, hasBox: true, angle: Math.PI / 2, name: 'platformPicker' });
    platformPicker.position.set(frontPlatformX - 35, 5.0, frontPlatformZ - 10);
    scene.add(platformPicker);

    // 6. Worker at Truck 1 Tailgate Unloading Inbound Freight
    const truck1Worker = createHumanFigure({ isPutaway: true, hasBox: true, angle: -Math.PI / 2, name: 'truck1Worker' });
    truck1Worker.position.set(frontPlatformX - 118, 5.0, frontPlatformZ + 12);
    scene.add(truck1Worker);

    // 7. Worker at Truck 2 Loading Outbound Express Cartons
    const truck2Worker = createHumanFigure({ isPutaway: false, hasBox: true, angle: Math.PI / 2, name: 'truck2Worker' });
    truck2Worker.position.set(frontPlatformX + 118, 5.0, frontPlatformZ + 12);
    scene.add(truck2Worker);

    // 8. Platform Supervisor Reviewing Pick Waves on Tablet
    const platformSupervisor = createHumanFigure({ isPutaway: false, hasBox: false, angle: -Math.PI / 4, name: 'platformSupervisor' });
    platformSupervisor.position.set(frontPlatformX + 35, 5.0, frontPlatformZ + 8);
    scene.add(platformSupervisor);

    // 15. DYNAMIC REAL-TIME CONVEYOR PARCELS (Box & Polybag Cover Animation)
    const conveyorParcels = [];
    const numParcels = 6;
    for (let i = 0; i < numParcels; i++) {
      const isBag = i % 2 === 1;
      const pMesh = isBag
        ? new THREE.Mesh(new THREE.BoxGeometry(8.5, 4.2, 7.0), new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.2, emissive: '#38bdf8', emissiveIntensity: 0.15 }))
        : new THREE.Mesh(new THREE.BoxGeometry(9.5, 6.8, 8.2), new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.7, emissive: '#78350f', emissiveIntensity: 0.1 }));
      
      // Barcode / Shipping Label on top of parcel
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 2.8),
        new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })
      );
      label.rotation.x = -Math.PI / 2;
      label.position.y = (isBag ? 2.2 : 3.5) + 0.1;
      pMesh.add(label);

      pMesh.castShadow = true;
      pMesh.userData = {
        progress: (i / numParcels),
        speed: 0.0035
      };
      scene.add(pMesh);
      conveyorParcels.push(pMesh);
    }

    // 16. EAST SIDE WING: 10 DEDICATED FAST-CHARGING TERMINAL PORTS (CHG-01 .. CHG-10)
    const eastChargingX = 395;
    const eastChargingZ = -30;
    const eastChargingGroup = new THREE.Group();
    eastChargingGroup.position.set(eastChargingX, 0, eastChargingZ);

    const chgRoomW = 150;
    const chgRoomD = 230;

    // A. Charging Facility Floor with Emerald Border
    const chgFloor = new THREE.Mesh(
      new THREE.BoxGeometry(chgRoomW, 2.2, chgRoomD),
      new THREE.MeshStandardMaterial({ color: '#06281e', roughness: 0.4, metalness: 0.6 })
    );
    chgFloor.position.y = 1.1;
    chgFloor.receiveShadow = true;
    eastChargingGroup.add(chgFloor);

    const chgHazardBorder = new THREE.Mesh(
      new THREE.BoxGeometry(chgRoomW + 2, 0.4, chgRoomD + 2),
      new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#059669', emissiveIntensity: 0.5 })
    );
    chgHazardBorder.position.y = 2.4;
    eastChargingGroup.add(chgHazardBorder);

    // B. 3D Billboard ("EAST WING: 10 DEDICATED FAST-CHARGING TERMINAL PORTS")
    try {
      const chgCanvas = document.createElement('canvas');
      chgCanvas.width = 512;
      chgCanvas.height = 80;
      const cctx = chgCanvas.getContext('2d');
      if (cctx) {
        cctx.fillStyle = '#030712';
        cctx.fillRect(0, 0, 512, 80);
        cctx.strokeStyle = '#10b981';
        cctx.lineWidth = 4;
        cctx.strokeRect(4, 4, 504, 72);
        cctx.fillStyle = '#34d399';
        cctx.font = 'bold 24px sans-serif';
        cctx.textAlign = 'center';
        cctx.textBaseline = 'middle';
        cctx.fillText('⚡ EAST WING: 10 FAST-CHARGING PORTS', 256, 40);

        const chgTex = new THREE.CanvasTexture(chgCanvas);
        const chgMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(chgRoomW * 0.9, 7.5),
          new THREE.MeshBasicMaterial({ map: chgTex, transparent: true, side: THREE.DoubleSide })
        );
        chgMesh.position.set(0, 36, chgRoomD / 2);
        eastChargingGroup.add(chgMesh);
      }
    } catch (e) {}

    // C. 10 Dedicated Vertical Charging Docks (2 columns of 5)
    for (let c = 0; c < 10; c++) {
      const col = c < 5 ? -25 : 25;
      const rowZ = (c % 5 - 2) * 38;
      const portGroup = new THREE.Group();
      portGroup.position.set(col, 2.2, rowZ);

      // Emerald Recharge Pad
      const portPad = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.8, 22),
        new THREE.MeshStandardMaterial({ color: '#064e3b', emissive: '#10b981', emissiveIntensity: 0.6, metalness: 0.7 })
      );
      portGroup.add(portPad);

      // Power Charging Terminal Pillar
      const portPillar = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 12.0, 4.5),
        new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9 })
      );
      portPillar.position.set(0, 6.0, -9.0);
      portGroup.add(portPillar);

      // Glowing Contact Terminal Head
      const portHead = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#34d399', emissiveIntensity: 0.9 })
      );
      portHead.position.set(0, 12.0, -9.0);
      portGroup.add(portHead);

      eastChargingGroup.add(portGroup);
    }

    scene.add(eastChargingGroup);

    // 12. Mouse & Orbit Controls
    const onMouseDown = (e) => {
      if (e.button === 0) controlsStateRef.current.isDragging = true;
      if (e.button === 2) controlsStateRef.current.isRightDragging = true;
      controlsStateRef.current.prevMouseX = e.clientX;
      controlsStateRef.current.prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      const ctrl = controlsStateRef.current;
      const deltaX = e.clientX - ctrl.prevMouseX;
      const deltaY = e.clientY - ctrl.prevMouseY;
      ctrl.prevMouseX = e.clientX;
      ctrl.prevMouseY = e.clientY;

      if (ctrl.isDragging) {
        ctrl.cameraAngleH -= deltaX * 0.0055;
        ctrl.cameraAngleV = Math.max(0.12, Math.min(Math.PI / 2.02, ctrl.cameraAngleV + deltaY * 0.0055));
      } else if (ctrl.isRightDragging) {
        const panSpeed = ctrl.cameraDistance * 0.0011;
        const right = new THREE.Vector3(Math.cos(ctrl.cameraAngleH + Math.PI / 2), 0, Math.sin(ctrl.cameraAngleH + Math.PI / 2));
        ctrl.cameraTarget.addScaledVector(right, -deltaX * panSpeed);
        ctrl.cameraTarget.z += deltaY * panSpeed * Math.cos(ctrl.cameraAngleH);
        ctrl.cameraTarget.x += deltaY * panSpeed * Math.sin(ctrl.cameraAngleH);
      }
    };

    const onMouseUp = () => {
      controlsStateRef.current.isDragging = false;
      controlsStateRef.current.isRightDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const ctrl = controlsStateRef.current;
      ctrl.cameraDistance = Math.max(120, Math.min(1200, ctrl.cameraDistance + e.deltaY * 0.45));
    };

    const onContextMenu = (e) => e.preventDefault();

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 17. Render Loop with Dynamic Conveyor Parcel Animation & Animated Human Figures
    let animId;
    let animClock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      animClock += 0.025;
      const ctrl = controlsStateRef.current;

      // A. Animate Conveyor Boxes & Polybag Covers along the curve
      conveyorParcels.forEach((pMesh) => {
        pMesh.userData.progress += pMesh.userData.speed;
        if (pMesh.userData.progress > 1.0) {
          pMesh.userData.progress = 0.0;
        }

        const prog = pMesh.userData.progress;
        const pt = conveyorCurve.getPointAt(Math.max(0.001, Math.min(0.999, prog)));
        pMesh.position.set(pt.x, pt.y + 2.8, pt.z);
        pMesh.rotation.y = prog * Math.PI * 0.5;
      });

      // B. Animate 3D Human Figures
      // 1. Walking Courier between Packing Room and Bikes
      const walkT = Math.sin(animClock * 1.8);
      const walkDir = Math.cos(animClock * 1.8);
      walkerCourier.position.x = (westPackingX - 50) + walkT * 22;
      walkerCourier.rotation.y = walkDir >= 0 ? -Math.PI / 2 : Math.PI / 2;
      
      const wLeftLeg = walkerCourier.getObjectByName('leftLeg');
      const wRightLeg = walkerCourier.getObjectByName('rightLeg');
      if (wLeftLeg && wRightLeg) {
        wLeftLeg.rotation.x = Math.sin(animClock * 6.5) * 0.45;
        wRightLeg.rotation.x = -Math.sin(animClock * 6.5) * 0.45;
      }
      const wHead = walkerCourier.getObjectByName('head');
      if (wHead) {
        wHead.position.y = 14.8 + Math.abs(Math.sin(animClock * 6.5)) * 0.35;
      }

      // 2. Active Packer taping/sealing boxes at workbench
      const pLeftArm = activePacker.getObjectByName('leftArm');
      const pRightArm = activePacker.getObjectByName('rightArm');
      if (pLeftArm && pRightArm) {
        pLeftArm.rotation.x = -0.7 + Math.sin(animClock * 3.2) * 0.35;
        pRightArm.rotation.x = -0.7 - Math.sin(animClock * 3.2) * 0.35;
      }

      // 3. Rider Loading delivery box onto parked bike
      const rLeftArm = riderLoading.getObjectByName('leftArm');
      const rRightArm = riderLoading.getObjectByName('rightArm');
      if (rLeftArm && rRightArm) {
        rLeftArm.rotation.x = -0.6 + Math.sin(animClock * 2.0) * 0.3;
        rRightArm.rotation.x = -0.6 + Math.sin(animClock * 2.0) * 0.3;
      }

      // 4. Packing Supervisor inspecting facility
      const sHead = packingSupervisor.getObjectByName('head');
      if (sHead) {
        sHead.rotation.y = Math.sin(animClock * 0.9) * 0.45;
      }

      // 5. Walking Platform Picker at South Picking Deck
      const pickT = Math.sin(animClock * 1.5);
      const pickDir = Math.cos(animClock * 1.5);
      platformPicker.position.x = (frontPlatformX - 20) + pickT * 28;
      platformPicker.rotation.y = pickDir >= 0 ? Math.PI / 2 : -Math.PI / 2;

      const pickLLeg = platformPicker.getObjectByName('leftLeg');
      const pickRLeg = platformPicker.getObjectByName('rightLeg');
      if (pickLLeg && pickRLeg) {
        pickLLeg.rotation.x = Math.sin(animClock * 6.0) * 0.45;
        pickRLeg.rotation.x = -Math.sin(animClock * 6.0) * 0.45;
      }
      const pickHead = platformPicker.getObjectByName('head');
      if (pickHead) {
        pickHead.position.y = 14.8 + Math.abs(Math.sin(animClock * 6.0)) * 0.3;
      }

      // 6. Worker at Truck 1 Tailgate Unloading Inbound Cartons
      const t1LeftArm = truck1Worker.getObjectByName('leftArm');
      const t1RightArm = truck1Worker.getObjectByName('rightArm');
      if (t1LeftArm && t1RightArm) {
        t1LeftArm.rotation.x = -0.5 + Math.sin(animClock * 2.8) * 0.4;
        t1RightArm.rotation.x = -0.5 + Math.sin(animClock * 2.8) * 0.4;
      }

      // 7. Worker at Truck 2 Loading Outbound Express Freight
      const t2LeftArm = truck2Worker.getObjectByName('leftArm');
      const t2RightArm = truck2Worker.getObjectByName('rightArm');
      if (t2LeftArm && t2RightArm) {
        t2LeftArm.rotation.x = -0.5 + Math.sin(animClock * 2.4) * 0.4;
        t2RightArm.rotation.x = -0.5 + Math.sin(animClock * 2.4) * 0.4;
      }

      // 8. Platform Supervisor Reviewing Pick Waves
      const supHead = platformSupervisor.getObjectByName('head');
      if (supHead) {
        supHead.rotation.y = Math.sin(animClock * 1.1) * 0.4;
      }

      if (cameraViewMode === 'FOLLOW' && selectedAgvId) {
        const selMesh = robotMeshesRef.current.get(selectedAgvId);
        if (selMesh) {
          ctrl.cameraTarget.lerp(selMesh.position, 0.08);
          ctrl.cameraDistance = 240;
          ctrl.cameraAngleV = Math.PI / 5.2;
        }
      }

      const camX = ctrl.cameraTarget.x + ctrl.cameraDistance * Math.sin(ctrl.cameraAngleH) * Math.cos(ctrl.cameraAngleV);
      const camY = ctrl.cameraTarget.y + ctrl.cameraDistance * Math.sin(ctrl.cameraAngleV);
      const camZ = ctrl.cameraTarget.z + ctrl.cameraDistance * Math.cos(ctrl.cameraAngleH) * Math.cos(ctrl.cameraAngleV);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(ctrl.cameraTarget);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      robotMeshesRef.current.clear();
      renderer.dispose();
    };
  }, []); // eslint-disable-line

  // ── Sync 3D AMR Robot Models ──────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !Array.isArray(fleet)) return;

    fleet.forEach((robot, idx) => {
      if (!robot || !robot.id) return;
      let rGroup = robotMeshesRef.current.get(robot.id);
      const cfg = ROBOT_TRACK_CONFIG[idx % ROBOT_TRACK_CONFIG.length] || { color: '#38bdf8', height: 1.2 };
      const trackColor = cfg.color;
      const robotHeight = cfg.height;

      if (!rGroup) {
        rGroup = new THREE.Group();

        // 1. AMR Chassis Body
        const bodyGeo = new THREE.BoxGeometry(19, 7.8, 14.5);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: '#d97706',
          metalness: 0.7,
          roughness: 0.35
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 4.8;
        body.castShadow = true;
        rGroup.add(body);

        // 2. Glowing LED Status Strip
        const ledStripGeo = new THREE.BoxGeometry(19.4, 1.5, 14.9);
        const ledStripMat = new THREE.MeshBasicMaterial({ color: trackColor });
        const ledStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
        ledStrip.position.y = 4.0;
        rGroup.add(ledStrip);

        // 3. 4 Rubber Wheels
        const wheelGeo = new THREE.CylinderGeometry(2.4, 2.4, 1.8, 12);
        const wheelMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.9 });
        [
          [-8, -5.8],
          [8, -5.8],
          [-8, 5.8],
          [8, 5.8]
        ].forEach(([wx, wz]) => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 2.4, wz);
          wheel.castShadow = true;
          rGroup.add(wheel);
        });

        // 4. Spinning LIDAR Sensor
        const lidarGeo = new THREE.CylinderGeometry(2.4, 2.6, 3.0, 16);
        const lidarMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9, roughness: 0.2 });
        const lidar = new THREE.Mesh(lidarGeo, lidarMat);
        lidar.position.y = 10.2;
        lidar.name = 'lidar';
        rGroup.add(lidar);

        // 5. Cargo Box Payload
        const payloadGeo = new THREE.BoxGeometry(12, 7.5, 9.5);
        const payloadMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 });
        const payload = new THREE.Mesh(payloadGeo, payloadMat);
        payload.position.y = 12.8;
        payload.name = 'payload';
        payload.castShadow = true;
        payload.visible = !!robot.hasPayload;
        rGroup.add(payload);

        // 6. Overhead 3D Hologram Robot ID Billboard
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 72;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const isPlatformPutaway = robot.id === 'AGV-11' || robot.id === 'AGV-12' || robot.id === 'AGV-01' || robot.id === 'AGV-02';
            ctx.fillStyle = isPlatformPutaway ? 'rgba(6, 78, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, 0, 240, 72);
            ctx.strokeStyle = isPlatformPutaway ? '#10b981' : trackColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(3, 3, 234, 66);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(robot.id, 120, 28);

            ctx.fillStyle = isPlatformPutaway ? '#34d399' : '#94a3b8';
            ctx.font = 'bold 11px sans-serif';
            let subLabel = '⚡ DEDICATED TRACK';
            if (robot.id === 'AGV-11') subLabel = '📦 PLATFORM TRACK 1 -> RACK A1/A2';
            else if (robot.id === 'AGV-12') subLabel = '📦 PLATFORM TRACK 2 -> RACK B1/B2';
            else if (robot.id === 'AGV-01') subLabel = '📦 PUTAWAY MASTER -> RACK A1';
            else if (robot.id === 'AGV-02') subLabel = '📦 RACK ARRANGER -> RACK B1';
            ctx.fillText(subLabel, 120, 54);

            const texture = new THREE.CanvasTexture(canvas);
            const tagMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const tagMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 5.4), tagMat);
            tagMesh.position.set(0, 21, 0);
            rGroup.add(tagMesh);
          }
        } catch (e) {
          // Fallback
        }

        // 7. Selection Focus Ring
        const haloGeo = new THREE.RingGeometry(14, 16, 32);
        const haloMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', side: THREE.DoubleSide });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.2;
        halo.name = 'halo';
        halo.visible = selectedAgvId === robot.id;
        rGroup.add(halo);

        scene.add(rGroup);
        robotMeshesRef.current.set(robot.id, rGroup);
      }

      // Update 3D Position & Elevation
      const currentX = robot.currentPosition?.x ?? 100;
      const currentY = robot.currentPosition?.y ?? 100;
      const pos3D = mapTo3D(currentX, currentY);
      rGroup.position.set(pos3D.x, robotHeight, pos3D.z);

      // Update Heading Rotation
      const headingRad = -(robot.heading || 0) * (Math.PI / 180);
      rGroup.rotation.y = headingRad;

      // Update Payload & Halo
      const payloadMesh = rGroup.getObjectByName('payload');
      if (payloadMesh) payloadMesh.visible = !!robot.hasPayload;

      const haloMesh = rGroup.getObjectByName('halo');
      if (haloMesh) haloMesh.visible = selectedAgvId === robot.id;

      // Spin LIDAR
      const lidarMesh = rGroup.getObjectByName('lidar');
      if (lidarMesh) lidarMesh.rotation.y += 0.18;
    });
  }, [fleet, selectedAgvId]);

  if (webglError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
        <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
        <h3>3D WebGL Acceleration Notice</h3>
        <p>{webglError}</p>
        <p style={{ color: '#94a3b8', fontSize: '12px' }}>Please switch to the 2D Guideway View above for interactive simulation.</p>
      </div>
    );
  }

  return (
    <div className="agv-3d-canvas-wrapper" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '620px' }}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* TOP CENTER CAMERA CONTROLS */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '4px',
          zIndex: 10
        }}
      >
        <button
          className={`outline-btn ${cameraViewMode === 'ISOMETRIC' ? 'active' : ''}`}
          onClick={() => applyCameraPreset('ISOMETRIC')}
          style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Camera size={13} />
          3D Orbit
        </button>
        <button
          className={`outline-btn ${cameraViewMode === 'TOP' ? 'active' : ''}`}
          onClick={() => applyCameraPreset('TOP')}
          style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Compass size={13} />
          Top-Down Plan
        </button>
        <button
          className={`outline-btn ${cameraViewMode === 'FOLLOW' ? 'active' : ''}`}
          onClick={() => applyCameraPreset('FOLLOW')}
          style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Bot size={13} />
          Follow {selectedAgvId || 'AGV-03'}
        </button>
        <button
          className={`outline-btn ${cameraViewMode === 'DEPOT' ? 'active' : ''}`}
          onClick={() => applyCameraPreset('DEPOT')}
          style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Sparkles size={13} />
          Depot View
        </button>
      </div>

      {/* TOP LEFT HUD: FLEET OVERVIEW */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(10, 15, 29, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          width: '210px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <b style={{ fontSize: '12px', color: '#e2e8f0', letterSpacing: '0.5px' }}>FLEET OVERVIEW</b>
          <span style={{ background: '#064e3b', color: '#34d399', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
            100% ONLINE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ background: '#0f172a', padding: '4px 2px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8.5px', color: '#64748b' }}>TOTAL</div>
            <strong style={{ fontSize: '14px', color: '#38bdf8' }}>10</strong>
          </div>
          <div style={{ background: '#0f172a', padding: '4px 2px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8.5px', color: '#64748b' }}>ACTIVE</div>
            <strong style={{ fontSize: '14px', color: '#34d399' }}>10</strong>
          </div>
          <div style={{ background: '#0f172a', padding: '4px 2px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8.5px', color: '#64748b' }}>IDLE</div>
            <strong style={{ fontSize: '14px', color: '#94a3b8' }}>0</strong>
          </div>
          <div style={{ background: '#0f172a', padding: '4px 2px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8.5px', color: '#64748b' }}>CHARGING</div>
            <strong style={{ fontSize: '14px', color: '#818cf8' }}>0</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #1e293b', fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>ACTIVE MISSIONS</span>
          <b style={{ color: '#34d399' }}>10</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>UTILIZATION</span>
          <b style={{ color: '#818cf8' }}>100%</b>
        </div>
      </div>

      {/* BOTTOM LEFT HUD: PACKAGING DEPOT & COURIER DOCKS & CHARGING STATIONS */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}
      >
        {/* AUTOMATED PACKING ROOM */}
        <div
          style={{
            background: 'rgba(10, 15, 29, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            minWidth: '260px'
          }}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BoxIcon size={13} color="#38bdf8" />
              AUTOMATED PACKING ROOM
            </span>
            <span style={{ fontSize: '8.5px', background: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
              5 STATIONS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {['BAY 01', 'BAY 02', 'BAY 03', 'BAY 04', 'BAY 05'].map(bay => (
              <div
                key={bay}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '4px',
                  padding: '4px 2px',
                  textAlign: 'center',
                  fontSize: '8.5px',
                  color: '#e2e8f0'
                }}
              >
                <div>{bay}</div>
                <CheckCircle2 size={10} color="#34d399" style={{ margin: '2px auto 0' }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
            📦 Carton Taping &bull; Polybag Sealing &bull; Laser Scan
          </div>
        </div>

        {/* MOTORIZED CONVEYOR & PICKING PLATFORM */}
        <div
          style={{
            background: 'rgba(10, 15, 29, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            minWidth: '240px'
          }}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={13} color="#818cf8" />
              PICKING &amp; DISPATCH PLATFORM
            </span>
            <span style={{ fontSize: '8.5px', background: '#4f46e5', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
              CONVEYOR ACTIVE
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['DOCK 01', 'DOCK 02'].map(dock => (
              <div
                key={dock}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '5px',
                  padding: '4px 6px',
                  fontSize: '9px',
                  color: '#93c5fd',
                  textAlign: 'center'
                }}
              >
                <b>{dock} &bull; ACTIVE</b>
                <div style={{ fontSize: '7.5px', color: '#64748b' }}>Conveyor Intake</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
            🚚 Continuous Parcel Flow to Courier Staging
          </div>
        </div>

        {/* CHARGING STATIONS (10 INDIVIDUAL DEDICATED PORTS) */}
        <div
          style={{
            background: 'rgba(10, 15, 29, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            padding: '10px 14px',
            minWidth: '340px'
          }}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={13} color="#34d399" />
              10 DEDICATED CHARGING PORTS (1 PER AMR)
            </span>
            <span style={{ fontSize: '9px', color: '#6ee7b7', background: '#064e3b', padding: '1px 6px', borderRadius: '4px' }}>
              ALL PORTS ACTIVE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {MAP_CONFIG.chargingStations.map(chg => (
              <div
                key={chg.id}
                style={{
                  background: '#07151e',
                  border: '1px solid #0f3d32',
                  borderRadius: '4px',
                  padding: '3px 2px',
                  textAlign: 'center',
                  fontSize: '8.5px',
                  color: '#a7f3d0'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{chg.id}</div>
                <div style={{ fontSize: '7.5px', color: '#6ee7b7' }}>{chg.agvId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
