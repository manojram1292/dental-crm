// Bundled to vendor/three.bundle.js (npm run vendor) so scenes can stay classic scripts.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
window.THREE = THREE;
window.THREE_ADDONS = { RoomEnvironment, RoundedBoxGeometry, mergeGeometries, mergeVertices, SVGLoader, GLTFLoader };
