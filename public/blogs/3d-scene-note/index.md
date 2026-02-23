*“遇到难回答问题，就不说话了”*

先下笔整理思绪。

## 目的

建模，建很多模型。每个模型都要匹配一个碰撞箱。

模型需要可以自由布局。

模型需要低面。

暂时不考虑渲染情况。

## 第一个

云朵吧，做一个大云朵。

嗯，方案就定为：
* 多个球布尔
* 大球 + 中球 + 小球
* 细分

实际方案：
* 大圆柱改为倒台型
* 周围铺满全球
* 没有多个布尔，只有单个物体添加修改器，布尔其它的集合，然后应用。并关闭原本集合
* 然后添加修改器重构网络，体素，调小参数，应用
* 最后再用插件 **四边重构**（*Quad Remesh brige*）

注意：台子和球需要一开始就做好细分和倒角，一定要先做好圆，然后再体素重构忽略间隙，再最后四边重构让线条圆滑

![](/blogs/3d-scene-note/268fb458dfc83eee.webp)

> 如果物体始终显示线条，考虑是单个物体开启了线条显示。在右侧 *物体-视图显示-线框* 设置

> 导出记得先应用缩放

## 导入

我感觉很完美。棒棒。

![](/blogs/3d-scene-note/294c666328f27e16.webp)

## 碰撞体

制作碰撞体无需重新建立简单几何体。

还是以模型本身，去除无需碰撞的面。然后可以创建简化面，如果面不多，也可以不管。

导入开启碰撞体，关闭显示，一定要设置 `colliders='trimesh'`
```tsx
<RigidBody colliders='trimesh' type='fixed' friction={1}>
	<mesh geometry={nodes['碰撞'].geometry} receiveShadow>
		<meshStandardMaterial color='#ffffff' transparent opacity={0} />
	</mesh>
</RigidBody>
```
![](/blogs/3d-scene-note/82d419dbbe1dd004.webp)