# 数据结构基础（FDS）复习笔记

> ZJU 数据结构基础 · 全英考试 · 中英双语笔记  
> 涵盖 PPT 全部知识点 + 历年真题（2015–2024 期末）

---

## Ch9 图（Graph）

### 9.1 定义与术语（Definitions & Terminology）

**Graph G = (V, E)** — 图由顶点集合 V（vertices）和边集合 E（edges）组成

- **Undirected graph（无向图）**：边没有方向，如 (u, v)
- **Directed graph / digraph（有向图）**：边有方向，如 <u, v>

**Key terms：**
- **Degree（度）**：与顶点相连的边的数量
  - 有向图中：**in-degree（入度）** + **out-degree（出度）**
  - **∑ in-degrees = ∑ out-degrees = |E|** ← 必考！
- **Path（路径）** / **Simple path（简单路径）** / **Cycle（环）**
- **Connected graph（连通图）** / **Connected component（连通分量）**
- **Complete graph Kₙ（完全图）**：无向时 |E| = n(n-1)/2，有向时 |E| = n(n-1)
- **DAG（Directed Acyclic Graph，有向无环图）**

### 9.2 图的表示（Graph Representation）

**① Adjacency Matrix（邻接矩阵）**
- 空间 O(V²) — 适合稠密图
- 查边 O(1)
- 遍历邻居 O(V)

**② Adjacency List（邻接表）** ← 考试常用
```c
struct AdjVNode {
    Vertex AdjV;
    PtrToAdjVNode Next;
};
struct Vnode {
    PtrToAdjVNode FirstEdge;
};
struct GNode {
    int N_v, N_e;
    AdjList G;
};
```
- 空间 **O(V + E)** — 适合稀疏图
- 查边 O(degree)，遍历邻居 O(degree)

> ⚠️ **陷阱**："邻接表空间只与顶点数有关" → **False！** 空间是 O(V+E)，也取决于边数。

### 9.3 拓扑排序（Topological Sort）

**定义**：DAG 中所有顶点的线性排列，每条边 (u, v) 中 u 出现在 v 之前。

**Kahn's Algorithm（卡恩算法）：**
1. 计算所有顶点的入度（in-degree）
2. 入度为 0 的顶点入队
3. 出队 → 输出 → 其所有邻居入度减 1，减到 0 则入队

**时间复杂度**：O(V + E)

> 如果有顶点未输出但队列空了 → 存在环（cycle）

**真题：判断一个序列是不是合法拓扑序列**
- 检查序列中每个顶点在此时入度是否为 0
- 是则将其邻居入度减 1
- 继续下一个

### 9.4 图的遍历（Graph Traversals）

**BFS（广度优先搜索）** — 用队列
- 类似二叉树的 level-order 遍历
- 无权图的最短路径

**DFS（深度优先搜索）** — 用栈（递归或显式）
- DFS 树中的边类型：**Tree edge（树边）**、**Back edge（回边，表示有环）**、Forward edge、Cross edge

### 9.5 最短路径（Shortest Path）

**无权图**：BFS O(V+E)

**带权图 — Dijkstra's Algorithm（迪杰斯特拉算法）**
- 只适用于 **非负权边（non-negative weights）**
- 贪心：每次从未访问顶点中选 dist 最小的
- 时间复杂度：朴素 O(V²)，堆优化 O((V+E)log V)

**计数最短路径条数：**
```c
count[S] = 1;  // 初始化
count[其他] = 0;
// 松弛边 (V,W) 时：
if (dist[V] + weight < dist[W]) {
    dist[W] = dist[V] + weight;
    count[W] = count[V];
} else if (dist[V] + weight == dist[W]) {
    count[W] += count[V];
}
```
> ⚠️ **重要陷阱**：所有边权都 +1 → **最短路径可能改变！**（边数多的路径被惩罚更多）

> **Dijkstra 为什么保证最短？** 因为每次选的是未访问中 dist 最小的，所有边权非负，它不可能被更小的超越了。

### 9.6 最小生成树（Minimum Spanning Tree, MST）

**Prim's Algorithm**：从顶点出发，每次选连接已选集合与外部顶点的最小权边。类似 Dijkstra。

**Kruskal's Algorithm**：从边出发，每次选最小权边且不形成环 → 用 **并查集（Union-Find）** 检测环。O(E log E)。

### 9.7 网络流（Network Flow — Ford-Fulkerson）

在残量图（residual graph）中反复找增广路径（augmenting path），增加瓶颈容量，直到找不到为止。

**Max Flow = Min Cut Theorem（最大流 = 最小割定理）**

### 9.8 关节点（Articulation Point / Cut Vertex）

**定义**：删除后图不连通的顶点。

用 DFS 找，需要计算：
- **Num(v)**：DFS 访问顺序编号
- **Low(v)** = min { Num(v), Low(child) for 树边, Num(w) for 回边 (v, w) }

**判断规则：**
1. **根节点**：有 ≥ 2 个子树 → 关节点
2. **非根节点 v**：存在子节点 w 满足 **Low(w) ≥ Num(v)** → 关节点

### 9.9 欧拉回路与欧拉路径（Euler Circuit & Path）

**Euler circuit（欧拉回路）**：经过每条边恰好一次并回到起点
- 无向图：所有顶点度数为偶数 + 连通
- 有向图：每个顶点入度 = 出度 + 强连通

**Euler path（欧拉路径）**：经过每条边恰好一次但不一定回到起点
- 无向图：恰好 2 个顶点度数为奇数
- 有向图：恰好一个顶点出度 = 入度 + 1，一个入度 = 出度 + 1

> ⚠️ **不要混淆**：Euler circuit 经过每条边一次；Hamiltonian circuit 经过每个顶点一次（NP-Complete！）

### 9.10 常见陷阱总结

| 陷阱说法 | 正解 |
|---------|------|
| "BFS twice → 有环"| ❌ 不连通而已，和环无关 |
| "邻接表空间只取决于顶点数" | ❌ O(V+E) |
| "边权全部+1 → 最短路径不变" | ❌ 可能变 |
| "Euler circuit 经过每个顶点一次" | ❌ 那是 Hamiltonian |

---

## Ch8 并查集（Disjoint Set / Union-Find）

### 8.1 核心操作

- **Find(x)**：找 x 所在集合的根
- **Union(x, y)**：合并 x 和 y 所在的两个集合

### 8.2 基本实现

```c
void Initialize(int S[], int n) {
    for (int i = 0; i < n; i++)
        S[i] = -1;  // -1 表示自己是根，集合大小为 1
}
int Find(int S[], int x) {
    while (S[x] >= 0) x = S[x];
    return x;
}
void Union(int S[], int root1, int root2) {
    S[root2] = root1;
}
```

### 8.3 优化策略

**Union by Size（按大小合并）：** 小树挂到大树上 → 高度 ≤ log₂N
```c
if (S[root2] > S[root1]) {    // root2 更小（存的是负数）
    S[root1] += S[root2];
    S[root2] = root1;
} else { ... }
```

**Path Compression（路径压缩）：** Find 时把路径上所有节点直接指向根
```c
int Find(int S[], int x) {
    if (S[x] < 0) return x;
    return S[x] = Find(S, S[x]);
}
```

### 8.4 时间复杂度

| 策略 | 单次操作均摊复杂度 |
|:----|:---------------:|
| 朴素 Union | O(N) |
| Union by Size（无路径压缩） | O(log N) |
| **Union by Size + Path Compression** | **O(α(N))** — 几乎 O(1) |

### 8.5 常见陷阱

> ⚠️ Union 时一定要传 **root**，不能直接传元素！

---

## Ch7 哈希表（Hashing）

### 7.1 基本概念

- **Hash function H(key)**：把 key 映射到数组位置
- **Collision（冲突）**：两个不同的 key 映射到同一个哈希值 ← **定义！**
- **Load Factor λ = N / TableSize（装填因子）**

> 好的哈希函数要求：**地址分布均匀（evenly distributed）**

### 7.2 冲突解决策略

**① Linear Probing（线性探测）**：F(i) = i
- 容易产生 **primary clustering（一次聚集）**

**② Quadratic Probing（平方探测）**：F(i) = i²
- 如果 TableSize 是 **4k+3 形式的素数**，平方探测能遍历 **半个表**
- λ > 0.5 时可能需要 rehashing

**③ Double Hashing（双散列）**：F(i) = i × H₂(key)

### 7.3 平均查找长度（Average Search Length）⭐ 考试重点

**Successful search：** 所有已有元素查找比较次数之和 ÷ 元素个数

**Unsuccessful search：** 每个可能的哈希地址出发，**找到第一个空位**的比较次数之和 ÷ 可能的地址数

> ⚠️ 如果 H(key) = key % 7，表长为 11，未成功查找只算 **0~6**（共 7 个地址），因为 key%7 映射不到 7~10！

### 7.4 Rehashing（再散列）

当 λ 太大时 → 新表 ≈ 2 倍大小（下一个素数）→ 重新插入所有元素 → O(N)

### 7.5 Robin Hood Hashing

- 每个元素记录 probe distance d(x)
- 插入时：如果当前位置元素的 d < 待插入元素的 d，**交换**（"劫富济贫"）
- 最坏查找时间从 O(N) → **O(log N)**
- 代价：插入变慢，删除复杂

### 7.6 常见陷阱

> "Insert 和 Find 在哈希中时间复杂度相同" → ✅ True（理想的 O(1)，最坏都是 O(N)）

---

## Ch6 排序（Sorting）

### 6.1 各排序算法总结

| 算法 | 最好 | 最坏 | 平均 | 空间 | 稳定？ |
|:----|:---:|:---:|:---:|:---:|:-----:|
| **Insertion Sort** | O(N) | O(N²) | O(N²) | O(1) | ✅ |
| **Shell Sort** | O(N) | O(N²) | - | O(1) | ❌ |
| **Heap Sort** | O(N log N) | O(N log N) | O(N log N) | O(1) | ❌ |
| **Merge Sort** | O(N log N) | O(N log N) | O(N log N) | O(N) | ✅ |
| **Quick Sort** | O(N log N) | O(N²) | O(N log N) | O(log N) | ❌ |
| **Bucket Sort** | O(N) | O(N) | O(N) | O(N+B) | ✅ |
| **Radix Sort** | O(P(N+B)) | same | same | O(N+B) | ✅ |
| **Table Sort** | - | - | - | O(N) | depends |

### 6.2 重要考点

**Insertion Sort（插入排序）：**
- 对 **大部分有序** 的数据效率最高（最好 O(N)）
- 比 Selection Sort 好的原因：有序时比较次数少（I ✅），但空间一样（II ❌），移动次数一样（III ❌）

**Shell Sort（希尔排序）：**
- 不稳定 ❌
- Increment 序列影响复杂度
- 给第一趟后的结果反推初始 increment

**Heap Sort（堆排序）：**
- 建堆 O(N) + N 次 DeleteMin 各 O(log N) = O(N log N)
- 过程：建最大堆 → 每次 swap 堆顶和最后一个元素 → PercDown

**Merge Sort（归并排序）：**
- 归并趟数（merge passes）：**O(log N)**（不是 O(N log N)！）
- 每趟 O(N)，总 O(N log N)
- 需要额外 O(N) 空间

**Quick Sort（快速排序）：**
- 选 pivot 最好用 **Median of Three**
- **指针停止问题**：遇到 pivot 相等的元素，**两个指针都停**；只停一个 → 最坏 O(N²)
- Quick Select（找第 K 小元素）：平均 **O(N)**（只递归一边）

**Bucket Sort（桶排序）：**
- 1 位数（0~9）→ 10 个桶 → O(N)

**Radix Sort（基数排序）：**
- LSD：从低位到高位多次桶排序
- 时间复杂度 O(P(N+B))，P=位数，B=基数

**Table Sort（表排序）：**
- 通过移动索引/指针来排序
- 物理重排最多需要 **N/2 次交换**

### 6.3 稳定性速记

**Stable ✅：** Insertion, Bubble, Merge, Radix, Bucket  
**Unstable ❌：** Shell, Heap, Quick, Selection

---

## Ch5 优先队列 / 堆（Priority Queues / Heaps）

### 5.1 二叉堆（Binary Heap）

- **完全二叉树**，用数组存储，根在 **A[1]**
- A[i] 的左孩子 = A[2i]，右孩子 = A[2i+1]，父节点 = A[i/2]
- **Min-heap**：每个节点 ≤ 它的孩子
- **Max-heap**：每个节点 ≥ 它的孩子

### 5.2 基本操作

**Insert（插入）：** 放到末尾 → **上滤（Percolate Up）** → O(log N)

**DeleteMin（删除最小）：** 拿根 → 最后一个元素放根 → **下滤（Percolate Down）** → O(log N)

### 5.3 BuildHeap（建堆）— O(N)

从最后一个非叶节点（i = N/2）开始，逐个 PercDown。**不是 O(N log N)！**

### 5.4 d-Heap

每个节点有 d 个孩子：
- d 越大 → Insert 越快（树更矮）
- d 越大 → DeleteMin 越慢（要比较 d 个孩子）

### 5.5 重要结论

- Max-heap 中最小元一定在叶子节点，下标范围：⌊n/2⌋+1 到 n
- Min-heap 中最大元也一定在叶子节点

### 5.6 检查兄弟节点（Complete Binary Tree）

数组存储中，23 和 24 的父节点：23/2=11，24/2=12 → 不同父节点 → **不是兄弟**  
只有 2i 和 2i+1 才是兄弟（父节点都是 i）

### 5.7 叶子节点数

N 个节点的完全二叉树，叶子节点数 = **⌈N/2⌉**

---

## Ch4 二叉树 & 二叉搜索树（Binary Trees & BST）

### 4.1 二叉树性质

**性质 1：n₀ = n₂ + 1**（叶子节点数 = 度为 2 的节点数 + 1）← **常考！**

**应用**：判断是否存在满足条件的二叉树
- n = n₀ + n₁ + n₂，边数 = n - 1 = n₁ + 2n₂
- 代入 n₀ = n₂ + 1 可解

### 4.2 四种遍历

| 遍历 | 顺序 |
|:----|:----|
| **Preorder（前序）** | 根 → 左 → 右 |
| **Inorder（中序）** | 左 → 根 → 右 |
| **Postorder（后序）** | 左 → 右 → 根 |
| **Level-order（层序）** | 逐层从左到右（BFS） |

**唯一确定二叉树**：必须有 **Inorder** + Preorder 或 Postorder

### 4.3 BST（二叉搜索树）

- 左子树所有节点 < 根 < 右子树所有节点
- **中序遍历 = 递增序列**
- 删除：
  1. 叶子 → 直接删
  2. 一个孩子 → 用孩子替换
  3. 两个孩子 → 用右子树最小元（或左子树最大元）替换，再递归删

### 4.4 重要结论

> "Inorder 和 Postorder 相同 → 没有节点有右子树" → **True** ✅

> "BST 中 4 和 6 在同一层 → 5 一定是它们的父节点" → **False** ❌

> "2016 个节点有 16 个节点只有一个孩子"：解 n₀ = n₂ + 1，n = 2n₂ + n₁ + 1 → n₂ = 999.5，**不可能** → **False**

---

## Ch3 栈、队列与链表（Stack, Queue & List）

### 3.1 栈（Stack）— LIFO

**顺序栈：** 入栈/出栈只移动 top 指针，**不移动元素**

**中缀表达式转后缀表达式（Shunting-yard）：**
- 操作数直接输出
- 运算符：栈顶优先级 ≥ 当前 → 弹出到输出，然后当前入栈
- 左括号直接入栈，右括号弹到左括号
- 优先级：`* /` > `+ -`

### 3.2 队列（Queue）— FIFO

**循环队列（Circular Queue）：**
- **判空**：`front == rear`
- **判满**：`(rear + 1) % MaxSize == front`

**链表实现队列：** 前出后入。出队时要记得更新 rear（删最后一个元素时）

### 3.3 链表（Linked List）

**最常用操作是表尾插入 + 表头删除 → 最合适是 Singly Linked Circular List with Tail Pointer** ✅

**合并两个升序链表：**
- 最少比较次数：**1 次**（一个链表所有元素 ≤ 另一个第一个元素）
- 但时间复杂度仍然是 O(N)（要遍历到尾节点）

---

## Ch2 算法分析（Algorithm Analysis）

### 2.1 Big-O 速记

- O = 上界（≤），Ω = 下界（≥），Θ = 紧界（=）
- 常见大小：1 < log N < √N < N < N log N < N² < N³ < 2^N < N!

### 2.2 复杂度计算陷阱

```c
// 陷阱 1：N*2 是 2N，不是 N²！
for (i = 0; i < N*2; i++)           // 2N 次
    for (j = N*N; j > i; j--);      // N² 次
// → O(N³)

// 陷阱 2：j 不重置！
int j = 0;
for (i = 0; i < N; i++)
    for (; j < N && A[j] <= A[i]; j++);
// j 总共只加 N 次 → O(N)
```

### 2.3 斐波那契（Fibonacci）复杂度

| 实现 | 时间复杂度 | 空间复杂度 |
|:----|:---------:|:---------:|
| **递归（recursive）** | **O(F_N) ≈ O(2^N)** | **O(N)**（递归栈） |
| **迭代（iterative）** | **O(N)** | **O(1)** |

> (log N)² 是 O(N) 吗？✅ True（O 是上界，N 肯定大于 (log N)²）

---

## 附加：线段树（Segment Tree）

### 用途

对数组进行 **区间查询（range query）** 和 **单点更新（point update）**，均在 **O(log N)** 内完成。

### 核心操作

| 操作 | 时间复杂度 |
|:----|:---------:|
| **Build（建树）** | O(N) |
| **Query（区间查询）** | O(log N) |
| **Update（单点更新）** | O(log N) |

### 查询三种情况

1. **No Overlap（完全在查询范围外）** → return 0
2. **Total Overlap（完全在查询范围内）** → return tree[node]
3. **Partial Overlap（部分重叠）** → 递归左右孩子

### 实现要点

- 用数组存储，根在 tree[1]，左孩子 tree[2i]，右孩子 tree[2i+1]
- 需要开 **4 倍** 空间：`tree[4*N]`
- 不限于 sum，也适用 min / max / gcd 等

---

## 附录：易错题集

### 判断题陷阱

| 题目 | 答案 |
|:----|:----:|
| Shell sort is stable | **False** ❌ |
| Merge sort 的归并趟数是 O(N log N) | **False** ❌（是 O(log N)） |
| 邻接表空间只与顶点数有关 | **False** ❌ |
| BFS twice → 有环 | **False** ❌（不连通） |
| 所有边权+1 → 最短路径不变 | **False** ❌ |
| Euler circuit 经过每个顶点一次 | **False** ❌（那是 Hamiltonian） |
| 顺序表删除第一个 O(1)，插入最后一个 O(N) | **False** ❌（说反了） |
| 完全二叉树中 23 和 24 是兄弟 | **False** ❌ |
| BST 中 4 和 6 同层 → 5 是父节点 | **False** ❌ |
| 迭代 Fibonacci 的时间复杂度是 Θ(F_N) | **False** ❌（是 O(N)） |
| 有向图入度和 = 出度和 | **True** ✅ |
| 欧拉回路需要全偶数度 | **True** ✅ |
| 拓扑排序只能用于 DAG | **True** ✅ |
| 哈希 Insert 和 Find 时间复杂度相同 | **True** ✅ |
| Dijkstra visited 后距离不再更新 | **True** ✅ |

### 公式速记

- 完全图 Kₙ（无向）：|E| = n(n-1)/2
- 二叉树：n₀ = n₂ + 1
- 完全二叉树叶子数：⌈N/2⌉
- 完全二叉树父节点：i/2，孩子：2i、2i+1
- 循环队列判满：(rear+1)%MaxSize == front
- BuildHeap：O(N)
- Quick Select 平均：O(N)
- 并查集 Union by Size + Path Compression：O(α(N))

---

> *笔记制作于 2026.06 · 祝考试顺利！考 90+ 冲冲冲 🎉*
