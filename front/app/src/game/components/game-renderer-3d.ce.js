import * as THREE from 'three';
import * as CSG from 'three-bvh-csg';
import { getAppliedTheme } from '@/theme.js';

class GameRenderer3D extends HTMLElement {
  #isReady = false;
  #gameState = null;
  #animationId = null;
  #theme;
  #isDemo;

  #ball;
  #paddleLeft;
  #paddleRight;
  #table;
  #walls;

  #csgEvaluator;
  #scene;
  #camera;
  #renderer;

  constructor() {
    super();
    this.render = this.render.bind(this);
    this.loop = this.loop.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  connectedCallback() {
    this.#theme = getAppliedTheme();
    this.#isDemo = this.hasAttribute('demo');
  }

  disconnectedCallback() {
    this.stop();
  }

  #getWallMesh(wallMaterial) {
    const outerWallsBrush = new CSG.Brush(
      new THREE.BoxGeometry(this.#gameState.width, this.#gameState.height, this.#gameState.wallDepth),
      wallMaterial
    );
    outerWallsBrush.updateMatrixWorld();

    const innerWallsBrush = new CSG.Brush(
      new THREE.BoxGeometry(
        this.#gameState.width - 2 * this.#gameState.wallThickness,
        this.#gameState.height - 2 * this.#gameState.wallThickness,
        this.#gameState.wallDepth * 1.1
      ),
      wallMaterial
    );
    innerWallsBrush.updateMatrixWorld();

    const wallsBrush = this.#csgEvaluator.evaluate(outerWallsBrush, innerWallsBrush, CSG.SUBTRACTION);
    wallsBrush.position.z = this.#gameState.wallDepth / 2;
    wallsBrush.updateMatrixWorld();

    return wallsBrush;
  }

  #getTableMesh(tableMaterial) {
    const tableBaseBrush = new CSG.Brush(
      new THREE.BoxGeometry(this.#gameState.tableWidth, this.#gameState.tableHeight, this.#gameState.tableDepth),
      tableMaterial
    );
    tableBaseBrush.position.z = -this.#gameState.tableDepth / 2 + this.#gameState.tableBoardHoleDepth;
    tableBaseBrush.updateMatrixWorld();

    const tableBoardHoleBrush = new CSG.Brush(
      new THREE.BoxGeometry(this.#gameState.width, this.#gameState.height, this.#gameState.tableBoardHoleDepth * 2),
      tableMaterial
    );
    tableBoardHoleBrush.position.z = this.#gameState.tableBoardHoleDepth;
    tableBoardHoleBrush.updateMatrixWorld();

    const tableLegsHoleBrush = new CSG.Brush(
      new THREE.BoxGeometry(this.#gameState.width, this.#gameState.tableHeight * 1.1, this.#gameState.tableDepth),
      tableMaterial
    );
    tableLegsHoleBrush.position.z =
      -this.#gameState.tableDepth / 2 -
      this.#gameState.tableDepth +
      this.#gameState.tableLegsSize +
      this.#gameState.tableBoardHoleDepth;
    tableLegsHoleBrush.updateMatrixWorld();

    let tableBrush = this.#csgEvaluator.evaluate(tableBaseBrush, tableLegsHoleBrush, CSG.SUBTRACTION);
    tableBrush = this.#csgEvaluator.evaluate(tableBrush, tableBoardHoleBrush, CSG.SUBTRACTION);

    return tableBrush;
  }

  init(gameState) {
    if (this.#gameState) {
      this.update(gameState);
      return;
    }

    this.#gameState = gameState;

    // set CSS
    this.style.display = 'block';
    this.style.overflow = 'hidden';
    if (this.#isDemo) {
      this.style.aspectRatio = 2;
    } else {
      this.style.aspectRatio = `${gameState.width} / ${gameState.height}`;
    }

    // get CSS variables
    const style = getComputedStyle(this);
    const cssvar = name => style.getPropertyValue(name);

    // scene
    this.#scene = new THREE.Scene();

    // CSG
    this.#csgEvaluator = new CSG.Evaluator();

    // camera
    if (this.#isDemo) {
      this.#camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.#camera.position.set(0, -1500, 600);
      this.#camera.lookAt(0, -this.#gameState.height * 0.75, 0);
    } else {
      this.#camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.#camera.position.set(0, 0, 1000);
      this.#camera.lookAt(0, 0, 0);
    }

    const light = new THREE.PointLight(0xffffff, 500000);
    light.position.set(0, 0, 700);
    this.#scene.add(light);

    const light2 = new THREE.PointLight(0xffffff, 500000);
    light2.position.set(-500, 0, 700);
    this.#scene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 500000);
    light3.position.set(500, 0, 700);
    this.#scene.add(light3);

    const bottomLight = new THREE.PointLight(0xffffff, 100000);
    bottomLight.position.set(0, 0, -500);
    this.#scene.add(bottomLight);

    const bottomLight2 = new THREE.PointLight(0xffffff, 500000);
    bottomLight2.position.set(0, -700, 200);
    this.#scene.add(bottomLight2);

    const bottomLight3 = new THREE.PointLight(0xffffff, 500000);
    bottomLight3.position.set(0, 700, 200);
    this.#scene.add(bottomLight3);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.#scene.add(ambientLight);

    // renderer
    this.#renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    this.appendChild(this.#renderer.domElement);

    // table
    const tableMaterial = new THREE.MeshStandardMaterial({ color: cssvar('--bs-body-bg') });
    if (this.#isDemo) {
      this.#table = this.#getTableMesh(tableMaterial);
    } else {
      this.#table = new THREE.Mesh(
        new THREE.PlaneGeometry(this.#gameState.width, this.#gameState.height),
        tableMaterial
      );
    }
    this.#scene.add(this.#table);

    // walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: cssvar('--bs-body-color') });
    this.#walls = this.#getWallMesh(wallMaterial);
    this.#scene.add(this.#walls);

    // ball
    const ballGeometry = new THREE.BoxGeometry(
      this.#gameState.ball.width,
      this.#gameState.ball.height,
      this.#gameState.ballSize
    );
    const ballMaterial = new THREE.MeshStandardMaterial({ color: cssvar('--bs-body-color') });
    this.#ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.#ball.position.z = this.#gameState.ballSize / 2;
    this.#scene.add(this.#ball);

    // paddle left
    const paddleLeftGeometry = new THREE.BoxGeometry(
      this.#gameState.paddleLeft.width,
      this.#gameState.paddleLeft.height,
      this.#gameState.paddleDepth
    );
    const paddleLeftMaterial = new THREE.MeshStandardMaterial({ color: cssvar('--bs-primary') });
    this.#paddleLeft = new THREE.Mesh(paddleLeftGeometry, paddleLeftMaterial);
    this.#paddleLeft.position.z = this.#gameState.paddleDepth / 2;
    this.#scene.add(this.#paddleLeft);

    // paddle right
    const paddleRightGeometry = new THREE.BoxGeometry(
      this.#gameState.paddleRight.width,
      this.#gameState.paddleRight.height,
      this.#gameState.paddleDepth
    );
    const paddleRightMaterial = new THREE.MeshStandardMaterial({ color: cssvar('--bs-secondary') });
    this.#paddleRight = new THREE.Mesh(paddleRightGeometry, paddleRightMaterial);
    this.#paddleRight.position.z = this.#gameState.paddleDepth / 2;
    this.#scene.add(this.#paddleRight);

    // clipping planes
    if (!this.#isDemo) {
      this.#renderer.clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(1, 0, 0), this.#gameState.width / 2 + 0.1),
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.#gameState.width / 2 + 0.1),
        new THREE.Plane(new THREE.Vector3(0, 1, 0), this.#gameState.height / 2 + 0.1),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), this.#gameState.height / 2 + 0.1),
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.1),
      ];
    }

    this.#isReady = true;
  }

  update(newState) {
    if (!this.#isReady) return;
    this.#gameState = {
      ...this.#gameState,
      ...newState,
    };
  }

  render() {
    if (!this.#isReady) return;
    this.#renderer.setSize(this.clientWidth, this.clientHeight);

    this.#camera.aspect = this.clientWidth / this.clientHeight;
    this.#camera.updateProjectionMatrix();

    // ball
    const ballPosition = this.#getCenter(this.#gameState.ball);
    this.#ball.position.x = ballPosition.x;
    this.#ball.position.y = ballPosition.y;

    // paddle left
    const paddleLeftPosition = this.#getCenter(this.#gameState.paddleLeft);
    this.#paddleLeft.position.x = paddleLeftPosition.x;
    this.#paddleLeft.position.y = paddleLeftPosition.y;

    // paddle right
    const paddleRightPosition = this.#getCenter(this.#gameState.paddleRight);
    this.#paddleRight.position.x = paddleRightPosition.x;
    this.#paddleRight.position.y = paddleRightPosition.y;

    // colors
    const newTheme = getAppliedTheme();
    if (this.#theme !== newTheme) {
      this.#theme = newTheme;
      const style = getComputedStyle(this);
      const cssvar = name => style.getPropertyValue(name);
      (this.#table.material[0] || this.#table.material).color.setStyle(cssvar('--bs-body-bg'));
      this.#walls.material[0].color.setStyle(cssvar('--bs-body-color'));
      this.#ball.material.color.setStyle(cssvar('--bs-body-color'));
    }

    this.#renderer.render(this.#scene, this.#camera);
  }

  loop() {
    if (!this.#isReady) return;
    this.render();
    this.#animationId = requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.#isReady || this.#animationId) return;
    this.loop();
  }

  stop() {
    if (!this.#animationId) return;
    cancelAnimationFrame(this.#animationId);
    this.#animationId = null;
  }

  #getCenter(rect, time) {
    if (!rect) return { x: 0, y: 0 };

    time = time || Date.now();
    if (rect.startTime >= rect.endTime) return rect.endCenter;
    if (time > rect.endTime) return rect.endCenter;
    if (time < rect.startTime) return rect.startCenter;

    const progress = (time - rect.startTime) / (rect.endTime - rect.startTime);
    const center = {
      x: rect.startCenter.x + (rect.endCenter.x - rect.startCenter.x) * progress,
      y: rect.startCenter.y + (rect.endCenter.y - rect.startCenter.y) * progress,
    };
    return center;
  }
}

customElements.define('game-renderer-3d', GameRenderer3D);
