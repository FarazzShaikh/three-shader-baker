import * as THREE from "three";

export class FullScreenQuad {
  private _mesh: THREE.Mesh;
  private _camera: THREE.OrthographicCamera;

  constructor(material?: THREE.Material) {
    this._mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 1, 1), material);
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  dispose() {
    this._mesh.geometry.dispose();
  }

  render(renderer: THREE.WebGLRenderer) {
    renderer.render(this._mesh, this._camera);
  }

  get material() {
    return this._mesh.material;
  }

  set material(value) {
    this._mesh.material = value;
  }
}
