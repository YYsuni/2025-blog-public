之前的体系已经全都证明行不通了，于是，决定进行一下转变

一个全新的、斯巴拉西的G4/ThT体系用来检测HPV18片段的想法油然而生

参考了"Dual fluorescence output aptamer sensing of cortisol in Cushing syndrome samples assisted by tandem hybridization chain reaction“和"A novel aptasensor based on HCR and G-quadruplex DNAzyme for fluorescence detection of Carcinoembryonic Antigen"决定设立一个全新的用HCR来进行G4/ThT检测的路子

原理是HPV18打开H1，H1打开H2，然后进行HCR。而G4则是被锁在在了H1、H2里面，只要HCR成功触发，那么就可以释放出G4，与ThT结合发光（师姐那篇文章曾提及，除了G43，和ThT效果最好的就是G4）

so，开始设计实验
首先，由于两篇文献的缓冲液不同，所以根据原理分成两套来设计。第一套缓冲液10mM MOPS&100mM NaNO₃；第二套20mM Tris-HCl (150mM NH₄Cl.20mM KCl)，两套内其余试剂浓度相同，H1、H2-0.5μM，ThT-45μM

所有试剂先90°C水浴10min，然后25°C冷却2h，接着就按下面分组添加试剂

|     | H₁  | H₂  |    T    |
| --- | :-: | :-: | :-----: |
| ①   |  √  |     |         |
| ②   |     |  √  |         |
| ③   |  √  |  √  |         |
| ④   |  √  |  √  | +1nM T  |
| ⑤   |  √  |  √  | +10nM T |
| ⑥   |  √  |  √  | +50nM T |

由于两套缓冲不同，所以实际上是12管，但由于除了缓冲都一样，按照6组来记录。

对于第一套，添加除了ThT外所有试剂，包括缓冲，然后水浴1.5h，最后半小时再加入ThT；对于第二套，所有试剂加入然后水浴俩小时。两个都是37°C下进行。然后两组都拿去测荧光，参数依旧不变，由于先测的缓冲液为MOPS的，所以1~ 6指的是缓冲液为MOPS的，而7~12指的是缓冲为Tris-HCl的，结果如下

| ①   | 20    | 17    |
| --- | ----- | ----- |
| ②   | 17    | 17    |
| ③   | 21    | 23    |
| ④   | 20    | 22    |
| ⑤   | 21    | 21    |
| ⑥   | 23    | 23    |
| ⑦   | 16    | 16    |
| ⑧   | 43.88 | 44.72 |
| ⑨   | 50.15 | 51.16 |
| ⑩   | 48.88 | 48.88 |
| ⑪   | 50.28 | 50.74 |
| ⑫   | 52.18 | 53.37 |
评价就是完全的失败，师兄的建议就是放弃别做，那就这样了，准备迎接假期 