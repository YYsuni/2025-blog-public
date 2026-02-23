学完基础建模，就该学人物动画了。但这是个坎。

> 技巧速记：快捷键 g+g 滑移，s + x/y/z + 0 快速平整

## 门槛

视频教学中，动画总是感觉很简单。使用插件 auto rig pro，然后点点点，人物骨骼、控制器就好了。

我试了下，发现出现大量节点，我不熟悉的东西。

然后姿势库、动画就开始米糊了。

再考虑到如何导出到 web。就开始犯嘀咕，怀疑是否能做到。

我感觉，这个过程，有很多我**没明白**的点。没明白，我就做不好，我需要解剖学习一下。

## 再定义

* 让角色人物结构更简单，避开人物建模失误带来的负面影响
* 不使用 *auto rig pro* 插件，让对节点产生的过程更清除

## 方块人

像我的世界人物那样，只有基本的四肢结构。

> 建立人物需要默认使用 -y 轴朝向，这是通常的统一做法。

![](/blogs/model-animation-note/0655bc33056c4af1.webp)

## 骨骼

骨骼为 E 挤出，X 删除，注意右键细分、命名、对称

![](/blogs/model-animation-note/64056f4ad4582d80.webp)

显示名称设置在右侧的（姿势）数据，*视图显示*中
![](/blogs/model-animation-note/3fcd090c04b083f9.webp)

## 蒙皮

tab 切换模式，基于不同物体；ctrl 切换子工具，通常切换姿势模式。

ctrl p *设置父级*，要后选骨架。因为后选元素会被设为父级。

绑定权重后，模型每个顶点都会出现一个权重数据。顶点组也会出现权重。

![](/blogs/model-animation-note/d9439555827bca34.webp)

权重绘制注意设置对称，和开启权重线辅助。

![](/blogs/model-animation-note/4208d55375f40938.webp)

## 动画

点击上方的*动画*布局，在*姿势模式*下，先设置好第一帧的状态，比如手自然放下。

a 全选骨骼，i 记录当前所有骨骼状态。

右下角设置总帧数，设置帧率在右侧*输出*面板
![](/blogs/model-animation-note/e709fcba9ec2ca5e.webp)

选取帧 shift + d 复制，g 依旧是滑移，s 缩放，原点在当前帧
![](/blogs/model-animation-note/45159e0453a583d0.webp)


### 姿势

在资产浏览器中，可以创建姿势，创建姿势前记得选中所有骨骼，这样就会保留当前骨骼状态到一个姿势。

动画导入为 threejs 的 **AnimiationClip**。姿势不会被导入，但是容易误操作成单独的动作。

### 多个动画

默认动画摄影表里，是认知不到当前动画的。需要切换到**动作编辑器**，窗口中上部有一个**动作关联**。新建一个动作可以点 x ，清空当前选中的动作，就会进入未选中状态，出现新建按钮。也可以直接复制动作。右侧的槽不需要管，k 帧时自己会生成。

> 槽(slot)，一般用来叠加多个状态

![](/blogs/model-animation-note/c75216064555fee3.webp)

### 导入 Web

这里用 **drei** 自带的 **useAnimations**，场景使用 **primitive** 标签，不建议单独使用 skinnedMesh 去单独绘制人物，会丢失动画。

blender 中设置的结束帧范围，对导出的不同动画时常没有关系。

```tsx
export function CubeMan() {
	const gltf = useGLTF('/models/方块人.glb') as any
	const { scene, animations, nodes } = gltf
	const { actions, names } = useAnimations(animations, scene)

	useEffect(() => {
		const defaultAction = actions[names[2]]
		if (defaultAction) {
			defaultAction.play()
		}
	}, [actions, names])

	return <primitive object={scene} />
}
```

导出时，骨骼、蒙皮 等注意保留，数据不大。