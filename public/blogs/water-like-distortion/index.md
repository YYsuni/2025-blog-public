- 原网站：[https://yoyogipark.trunk-hotel.com/en/about](https://yoyogipark.trunk-hotel.com/en/about)
- 相关网站：
  - [https://codesandbox.io/p/sandbox/threejs-ripple-text-distortion-effect-wlt94?file=%2Fsrc%2FTouchTexture.js%3A111%2C15-111%2C18](https://codesandbox.io/p/sandbox/threejs-ripple-text-distortion-effect-wlt94?file=%2Fsrc%2FTouchTexture.js%3A111%2C15-111%2C18)
  - [https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js/](https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js/)
  - [https://github.com/pmndrs/postprocessing?tab=readme-ov-file](https://github.com/pmndrs/postprocessing?tab=readme-ov-file)
  - [https://docs.pmnd.rs/react-three-fiber/getting-started/examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
  - [https://threejs.org/docs/index.html#examples/en/geometries/TextGeometry](https://threejs.org/docs/index.html#examples/en/geometries/TextGeometry)
  - [https://drei.pmnd.rs/?path=/docs/abstractions-text--docs](https://drei.pmnd.rs/?path=/docs/abstractions-text--docs)

## 笔记

- 采用 three 的后处理。
- 使用两个画布，一个画布捕捉手势，并以颜色存储偏移数据；一个画布为 three 渲染场景。

```tsx
<Canvas>
  <Screen />
  <EffectComposer>
    <WaterEffect texture={texture} />
    <Noise />
  </EffectComposer>
</Canvas>

<canvas ref={canvasRef} className='absolute left-0 top-0 opacity-0' width={500} height={300} />
```

```tsx
import * as THREE from 'three'
import { Effect } from 'postprocessing'
import { forwardRef, useMemo } from 'react'

let _texture: any

class WaterEffectImpl extends Effect {
	constructor({ texture }: { texture: THREE.Texture | null }) {
		super('WaterEffect', fragment, {
			uniforms: new Map([['uTexture', new THREE.Uniform(texture)]])
		})

		_texture = texture
	}

	update() {
		if (this.uniforms.get('uTexture')) this.uniforms.get('uTexture')!.value = _texture
	}
}

const fragment = `

uniform sampler2D uTexture;

void mainUv(inout vec2 uv) {
        vec4 tex = texture2D(uTexture, uv);
        float angle = -((tex.r) * (PI * 2.) - PI) ;
        float vx = -(tex.r *2. - 1.);
        float vy = -(tex.g *2. - 1.);
        float intensity = tex.b;
        uv.x += vx * 0.15 * intensity;
        uv.y += vy * 0.15  *intensity;
    }

`

// Effect component
export const WaterEffect = forwardRef<any, { texture: THREE.Texture | null }>(({ texture }, ref) => {
	const effect = useMemo(() => new WaterEffectImpl({ texture }), [texture])

	return <primitive ref={ref} object={effect} dispose={null} />
})

export default WaterEffect
```