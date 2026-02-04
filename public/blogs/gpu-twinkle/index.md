如下实现，左边 threejs 启用的 GPU 计算 shader 像素值，由于小数点位数太多会导致每次计算是不同的值，使渲染的随机值闪烁。

<iframe
	src='https://practices-sandy.vercel.app/random-shader'
	style={{ border: 0 }}
	allowfullscreen
	width="100%"
	height="600px"
	loading='lazy'></iframe>

## 随机代码

经典的一个伪随机数生成函数

```glsl
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}
```
`*43758.5453123` 将结果急剧放大，导致精度崩塌。

**在极高精度下，显卡（GPU）不保证每一帧的计算结果完全一模一样。**

## 解释

**指令优化**（FMA）：现代显卡经常使用“融合乘加”指令（Fused Multiply-Add）。例如计算 a * b + c。有的显卡会先算乘法再算加法（两次舍入），有的会一次性算完（一次舍入）。不同的计算路径会导致最后那几位微小的小数不同。

**计算顺序的不确定性**：GPU 同时处理成千上万个像素。由于热量管理、负载均衡，某些像素的计算顺序或硬件单元分配在每一帧可能会有极其微小的差异。

**超越函数**（sin/cos）的实现：sin 函数在 GPU 硬件层面通常不是通过完美的数学计算，而是通过多项式逼近或查找表实现的。这种逼近在不同频率或不同负载下，可能会有极微小的波动。

## 测试一个公式

$$ \mathcal{L}{\text{SM}} = -\frac{1}{4} G{\mu\nu}^a G^{a\mu\nu} -\frac{1}{4} W_{\mu\nu}^i W^{i\mu\nu} -\frac{1}{4} B_{\mu\nu} B^{\mu\nu} + \bar{\psi}j \left( i \gamma^\mu D\mu - m_j \right) \psi_j + \text{h.c.} + \left( D_\mu \phi \right)^\dagger \left( D^\mu \phi \right) - V(\phi) - \bar{\psi}i y{ij} \phi \psi_j + \text{h.c.} $$