import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { portfolio } from '../data/portfolio'

export type SceneControls = {
  focus: number
  works: number
  pointerX: number
  pointerY: number
  reduceMotion: boolean
}

const CHARACTER_HEIGHT = 7.8
const CHARACTER_WIDTH = CHARACTER_HEIGHT * (1086 / 1449)
const RELIEF_SEGMENTS_X = 128
const RELIEF_SEGMENTS_Y = 170
const IRIS_RADIUS = 0.12
const GAZE_LIMIT_X = 0.22
const GAZE_LIMIT_Y = 0.08
const EYE_ANCHORS = [
  { x: -0.587, y: 0.76 },
  { x: 0.726, y: 0.76 },
]

type CameraFrame = {
  position: THREE.Vector3
  target: THREE.Vector3
  rotateY: number
  rotateZ: number
  fov: number
}

type SurfaceHit = {
  mesh: THREE.Mesh | null
  point: THREE.Vector3
  normal: THREE.Vector3
}

type CharacterAsset = {
  root: THREE.Group
  meshes: THREE.Mesh[]
  focus: SurfaceHit[]
  eyes: SurfaceHit[]
}

function makeDecalTexture(_mark: string, index: number, logo?: THREE.Texture) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  const logoOnly = Boolean(logo?.image)
  const logoAspect = logoOnly && logo?.image
    ? logo.image.width / Math.max(1, logo.image.height)
    : 2.72
  canvas.height = logoOnly ? Math.max(64, Math.round(canvas.width / Math.max(0.5, logoAspect))) : 256
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (logoOnly && logo?.image) {
    ctx.drawImage(logo.image as CanvasImageSource, 0, 0, canvas.width, canvas.height)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let offset = 0; offset < pixels.data.length; offset += 4) {
      const red = pixels.data[offset]
      const green = pixels.data[offset + 1]
      const blue = pixels.data[offset + 2]
      const max = Math.max(red, green, blue)
      const min = Math.min(red, green, blue)
      const spread = max - min
      const isBackground = index === 1
        ? max < 55
        : index === 2
          ? min > 220 && spread < 28
          : index === 3
            ? (min > 220 && spread < 35) || (max < 80 && spread < 35)
            : false
      if (isBackground) pixels.data[offset + 3] = 0
    }
    ctx.putImageData(pixels, 0, 0)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function gaussian(x: number, y: number, cx: number, cy: number, sx: number, sy: number) {
  const dx = (x - cx) / sx
  const dy = (y - cy) / sy
  return Math.exp(-0.5 * (dx * dx + dy * dy))
}

function createCharacterAsset(sourceTexture: THREE.Texture): CharacterAsset {
  const texture = sourceTexture.clone()
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = true
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true

  // Preserve every portrait pixel's x/y location. Only z is displaced, so the
  // front view remains true to the supplied image while small turns gain depth.
  const geometry = new THREE.PlaneGeometry(
    CHARACTER_WIDTH,
    CHARACTER_HEIGHT,
    RELIEF_SEGMENTS_X,
    RELIEF_SEGMENTS_Y,
  )
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const head = gaussian(x, y, 0, 0.72, 1.72, 2.12)
    const face = gaussian(x, y, 0, 0.45, 1.18, 1.42)
    const forehead = gaussian(x, y, 0, 1.08, 0.86, 0.66)
    const leftCheek = gaussian(x, y, -0.55, 0.04, 0.48, 0.4)
    const rightCheek = gaussian(x, y, 0.55, 0.04, 0.48, 0.4)
    const noseBridge = gaussian(x, y, 0, 0.42, 0.2, 0.46)
    const noseTip = gaussian(x, y, 0, 0.02, 0.28, 0.22)
    const neck = gaussian(x, y, 0, -1.62, 0.72, 0.98)
    const shoulders = gaussian(x, y, 0, -2.78, 2.48, 0.88)
    const depth =
      0.13 * head +
      0.13 * face +
      0.045 * forehead +
      0.075 * (leftCheek + rightCheek) +
      0.11 * noseBridge +
      0.17 * noseTip +
      0.075 * neck +
      0.035 * shoulders
    positions.setZ(i, depth)
  }
  positions.needsUpdate = true
  geometry.computeVertexNormals()

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.015,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  const characterMesh = new THREE.Mesh(geometry, material)
  characterMesh.frustumCulled = false

  const root = new THREE.Group()
  root.add(characterMesh)
  root.updateMatrixWorld(true)
  const meshes = [characterMesh]
  const focus = portfolio.resume.map((entry) => findSurface(meshes, entry.focus.x, entry.focus.y))
  const eyes = EYE_ANCHORS.map((eye) => findSurface(meshes, eye.x, eye.y))
  return { root, meshes, focus, eyes }
}

function findSurface(meshes: THREE.Mesh[], x: number, y: number): SurfaceHit {
  const raycaster = new THREE.Raycaster()
  raycaster.set(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1))
  const hit = raycaster.intersectObjects(meshes, false)[0]
  if (!hit?.face || !(hit.object instanceof THREE.Mesh)) {
    return { mesh: null, point: new THREE.Vector3(x, y, 0), normal: new THREE.Vector3(0, 0, 1) }
  }
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
  return { mesh: hit.object, point: hit.point.clone(), normal }
}

function makeStickerMeshes(asset: CharacterAsset, textures: THREE.CanvasTexture[]) {
  return asset.focus.map((surface, index) => {
    const entry = portfolio.resume[index]
    const logoImage = entry.logoUrl ? textures[index]?.image as HTMLCanvasElement | undefined : undefined
    const logoAspect = logoImage
      ? logoImage.width / Math.max(1, logoImage.height)
      : 2.72
    const stickerHeight = entry.logoUrl ? Math.min(0.3, 0.68 / Math.max(1, logoAspect)) : 0.39
    const stickerWidth = entry.logoUrl ? Math.min(0.68, stickerHeight * logoAspect) : 0.78
    const size = new THREE.Vector3(stickerWidth, stickerHeight, 0.16)
    const material = new THREE.MeshBasicMaterial({
      map: textures[index],
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      opacity: index === 0 ? 1 : 0.92,
    })

    let geometry: THREE.BufferGeometry
    if (surface.mesh) {
      const normal = surface.normal.clone().normalize()
      const align = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
      const roll = new THREE.Quaternion().setFromAxisAngle(normal, entry.focus.rotation)
      const orientation = new THREE.Euler().setFromQuaternion(roll.multiply(align))
      geometry = new DecalGeometry(
        surface.mesh,
        surface.point,
        orientation,
        size,
      )
    } else {
      geometry = new THREE.PlaneGeometry(size.x, size.y)
    }

    const sticker = new THREE.Mesh(geometry, material)
    if (!surface.mesh) {
      sticker.position.copy(surface.point).addScaledVector(surface.normal, 0.018)
      sticker.rotation.z = entry.focus.rotation
    }
    sticker.renderOrder = 4
    sticker.frustumCulled = false
    return sticker
  })
}

function makeFrames(focus: SurfaceHit[]): CameraFrame[] {
  const hero: CameraFrame = {
    position: new THREE.Vector3(0, 0.05, 11.7),
    target: new THREE.Vector3(0, -0.05, 0), rotateY: 0, rotateZ: 0, fov: 36,
  }
  const cameraSides = [0.28, -0.25, 0.24, -0.2, 0.18]
  const portraitTurns = [-0.06, 0.05, -0.06, 0.05, -0.04]
  const focusDistances = [5.6, 5.1, 5.0, 4.8, 4.5]
  const focusLifts = [0.08, -0.06, 0.09, -0.05, 0.04]

  const chapters = portfolio.resume.map((entry, index) => {
    const rotateY = portraitTurns[index]
    const rotateZ = entry.focus.rotation
    const target = focus[index].point.clone().applyEuler(new THREE.Euler(0, rotateY, rotateZ))
    target.y -= 0.18
    return {
      position: new THREE.Vector3(
        target.x + cameraSides[index],
        target.y + focusLifts[index],
        target.z + focusDistances[index],
      ),
      target,
      rotateY,
      rotateZ,
      fov: 28,
    }
  })

  const works: CameraFrame = {
    position: new THREE.Vector3(0.15, -0.12, 10.4),
    target: new THREE.Vector3(0, -0.1, 0), rotateY: 0, rotateZ: 0, fov: 35,
  }
  return [hero, ...chapters, works]
}

export default function Scene({ controlsRef, activeFocus }: {
  controlsRef: MutableRefObject<SceneControls>
  activeFocus: number
}) {
  const portraitSource = useLoader(
    THREE.TextureLoader,
    `${import.meta.env.BASE_URL}assets/character-eye-base-clean.png`,
  )
  const asset = useMemo(() => createCharacterAsset(portraitSource), [portraitSource])
  const stickerLogoUrls = useMemo(
    () => portfolio.resume.flatMap((entry) => entry.logoUrl ? [entry.logoUrl] : []),
    [],
  )
  const stickerLogoTextures = useLoader(THREE.TextureLoader, stickerLogoUrls)
  const stickerLogos = useMemo(
    () => new Map<string, THREE.Texture>(
      stickerLogoUrls.map((url, index) => [url, stickerLogoTextures[index]] as const),
    ),
    [stickerLogoUrls, stickerLogoTextures],
  )
  const decalTextures = useMemo(
    () => portfolio.resume.map((entry, index) => makeDecalTexture(
      entry.mark,
      index,
      entry.logoUrl ? stickerLogos.get(entry.logoUrl) : undefined,
    )),
    [stickerLogos],
  )
  const stickers = useMemo(() => makeStickerMeshes(asset, decalTextures), [asset, decalTextures])
  const frames = useMemo(() => makeFrames(asset.focus), [asset])

  const character = useRef<THREE.Group>(null)
  const currentLook = useRef(new THREE.Vector3(0, 0, 0))
  const desiredLook = useRef(new THREE.Vector3())
  const desiredCamera = useRef(new THREE.Vector3())
  const worldPoint = useRef(new THREE.Vector3())
  const pupilRefs = useRef<(THREE.Group | null)[]>([])

  useEffect(() => {
    stickers.forEach((sticker, index) => {
      ;(sticker.material as THREE.MeshBasicMaterial).opacity = activeFocus === index ? 1 : 0.99
    })
  }, [activeFocus, stickers])

  useFrame(({ camera, size }, dt) => {
    const controls = controlsRef.current
    const pointerX = controls.reduceMotion ? 0 : controls.pointerX
    const pointerY = controls.reduceMotion ? 0 : controls.pointerY
    const focusProgress = THREE.MathUtils.clamp((controls.reduceMotion ? -1 : controls.focus) + 1, 0, portfolio.resume.length)
    let fromIndex = Math.min(Math.floor(focusProgress), portfolio.resume.length - 1)
    let mix = focusProgress >= portfolio.resume.length ? 1 : focusProgress - fromIndex
    if (!controls.reduceMotion && controls.works > 0) {
      fromIndex = portfolio.resume.length
      mix = THREE.MathUtils.clamp(controls.works, 0, 1)
    }
    const from = frames[fromIndex]
    const to = frames[fromIndex + 1]
    desiredCamera.current.lerpVectors(from.position, to.position, mix)
    desiredLook.current.lerpVectors(from.target, to.target, mix)
    if (size.width < 640) {
      desiredCamera.current.z = desiredLook.current.z + (desiredCamera.current.z - desiredLook.current.z) * 1.14
    }
    const smooth = 1 - Math.exp(-dt * 5.8)
    desiredCamera.current.x += pointerX * 0.08
    camera.position.lerp(desiredCamera.current, smooth)
    currentLook.current.lerp(desiredLook.current, smooth)
    camera.lookAt(currentLook.current)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, THREE.MathUtils.lerp(from.fov, to.fov, mix), 4, dt)
      camera.updateProjectionMatrix()
    }
    if (character.current) {
      const targetY = THREE.MathUtils.lerp(from.rotateY, to.rotateY, mix) + pointerX * 0.018
      const targetZ = THREE.MathUtils.lerp(from.rotateZ, to.rotateZ, mix)
      character.current.rotation.y = THREE.MathUtils.damp(character.current.rotation.y, targetY, 4.5, dt)
      character.current.rotation.z = THREE.MathUtils.damp(character.current.rotation.z, targetZ, 4.5, dt)
      character.current.position.y = THREE.MathUtils.damp(character.current.position.y, -0.18 + pointerY * 0.035, 4, dt)
    }

    for (const pupil of pupilRefs.current) {
      if (!pupil) continue
      pupil.getWorldPosition(worldPoint.current)
      worldPoint.current.project(camera)
      const dx = pointerX - worldPoint.current.x
      const dy = pointerY - worldPoint.current.y
      const baseX = pupil.userData.baseX as number
      const baseY = pupil.userData.baseY as number
      const goalX = baseX + THREE.MathUtils.clamp(dx * 0.3, -GAZE_LIMIT_X, GAZE_LIMIT_X)
      const goalY = baseY + THREE.MathUtils.clamp(dy * 0.24, -GAZE_LIMIT_Y, GAZE_LIMIT_Y)
      pupil.position.x = THREE.MathUtils.damp(pupil.position.x, goalX, 26, dt)
      pupil.position.y = THREE.MathUtils.damp(pupil.position.y, goalY, 26, dt)
    }
  })

  const frontNormal = new THREE.Vector3(0, 0, 1)
  return (
    <group>
      <group ref={character} position={[0, -0.18, 0]}>
        <primitive object={asset.root} />
        {stickers.map((sticker, index) => (
          <primitive key={portfolio.resume[index].id} object={sticker} />
        ))}
        {asset.eyes.map((eye, index) => {
          const rotation = new THREE.Quaternion().setFromUnitVectors(frontNormal, eye.normal)
          const surfacePosition = eye.point.clone().addScaledVector(eye.normal, 0.012)
          return (
            <group key={`eye-${index}`} position={surfacePosition} quaternion={rotation}>
              <group
                ref={(node) => {
                  pupilRefs.current[index] = node
                  if (node) { node.userData.baseX = 0; node.userData.baseY = 0 }
                }}
                position={[0, 0, 0.028]}
                renderOrder={6}
              >
                <mesh>
                  <circleGeometry args={[IRIS_RADIUS, 32]} />
                  <meshBasicMaterial color="#352822" toneMapped={false} />
                </mesh>
                <mesh position={[0, 0, 0.006]}>
                  <circleGeometry args={[0.072, 28]} />
                  <meshBasicMaterial color="#171b1d" toneMapped={false} />
                </mesh>
                <mesh position={[0.029, 0.039, 0.012]}>
                  <circleGeometry args={[0.025, 16]} />
                  <meshBasicMaterial color="#fff9ee" toneMapped={false} />
                </mesh>
              </group>
            </group>
          )
        })}
      </group>
    </group>
  )
}
