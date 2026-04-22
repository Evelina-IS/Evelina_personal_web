以下是您提供的复习笔记，其中所有原本用 `$$` 渲染的数学符号（包括行内和独立公式）已统一改为用 `$` 渲染。

```markdown
## 数据结构与算法分析 复习笔记

### 第2章 算法分析（Algorithm Analysis）

#### 3. 算法比较（Compare the Algorithms）

**问题**：给定整数序列 $A_1, A_2, \ldots, A_N$（可能为负数），求 $\sum_{k=i}^{j} A_k$ 的最大值。

**算法1**（三重循环，$O(N^3)$）：
```c
int MaxSubsequenceSum (const int A[], int N) {
    int ThisSum, MaxSum, i, j, k;
    MaxSum = 0; /* initialize the maximum sum */
    for( i = 0; i < N; i++) /* start from A[i] */
        for( j = i; j < N; j++) { /* end at A[j] */
            ThisSum = 0;
            for( k = i; k <= j; k++)
                ThisSum += A[k]; /* sum from A[i] to A[j] */
            if ( ThisSum > MaxSum )
                MaxSum = ThisSum; /* update max sum */
        } /* end for-j and for-i */
    return MaxSum;
}
```
$T(N) = O(N^3)$

**算法2**（两重循环，$O(N^2)$）：
```c
int MaxSubsequenceSum (const int A[], int N) {
    int ThisSum, MaxSum, i, j;
    MaxSum = 0; /* initialize the maximum sum */
    for(i = 0; i < N; i++) { /* start from A[i] */
        ThisSum = 0;
        for(j = i; j < N; j++) { /* end at A[j] */
            ThisSum += A[j]; /* sum from A[i] to A[j] */
            if (ThisSum > MaxSum)
                MaxSum = ThisSum; /* update max sum */
        } /* end for-j */
    } /* end for-i */
    return MaxSum;
}
```
$T(N) = O(N^2)$

**算法3**（分治，$O(N \log N)$）：
递归关系：$T(N) = 2T(N / 2) + cN, \quad T(1) = O(1)$
展开：
$= 2[2T(N / 2^2) + cN / 2] + cN$
$= 2^k O(1) + c k N$，其中 $N / 2^k = 1$
$= O(N \log N)$

**算法4**（在线算法 On-line Algorithm，$O(N)$）：
```c
int MaxSubsequenceSum( const int A[], int N) {
    int ThisSum, MaxSum, j;
    ThisSum = MaxSum = 0;
    for (j = 0; j < N; j++) {
        ThisSum += A[j];
        if (ThisSum > MaxSum)
            MaxSum = ThisSum;
        else if (ThisSum < 0)
            ThisSum = 0;
    } /* end for-j */
    return MaxSum;
}
```
$T(N) = O(N)$。A[] 只被扫描一次。在任何时刻，算法都能对已读入的数据给出正确的子序列和答案。

---

#### 4. 运行时间中的对数（Logarithms in the Running Time）

**二分查找（Binary Search）**：
给定：$A[0] \le A[1] \le \dots \le A[N-1]$ 和 X
任务：查找 X
输出：若 $X == A[i]$ 则返回 i，否则返回 -1

---

#### 5. 验证分析（Checking Your Analysis）

验证方法：
- 当 $T(N) = O(N)$，检查是否 $T(2N) / T(N) \approx 2$
- 当 $T(N) = O(N^2)$，检查是否 $T(2N) / T(N) \approx 4$
- 当 $T(N) = O(N^3)$，检查是否 $T(2N) / T(N) \approx 8$
- 一般情况：当 $T(N) = O(f(N))$，检查 $\lim_{N\to \infty} \frac{T(N)}{f(N)} \approx \text{Constant}$

---

### 第3章 表（List）

#### 1. 抽象数据类型（Abstract Data Type, ADT）

**定义**：数据类型 = { 对象 } ∪ { 操作 }
**示例**：int = {0, ±1, ±2, ..., INT_MAX, INT_MIN} ∪ {+, -, ×, ÷, %, ...}

**ADT定义**：抽象数据类型是指将对象的规格说明和操作的规格说明与对象的表示和操作的实现分离开来的数据类型。

---

#### 2. 表ADT（The List ADT）

**对象**：(item₀, item₁, ..., itemₙ₋₁)

**操作**：
- 求表的长度 N
- 打印表中所有元素
- 创建空表
- 查找第 k 个元素（$0 \le k < N$）
- 在第 k 个元素后插入新元素
- 删除表中的元素
- 查找当前元素的下一个元素
- 查找当前元素的前一个元素

---

**实现方式1：简单数组实现（Simple Array Implementation）**
- MaxSize 需要预先估计
- 查找第 k 个元素：$O(1)$ 时间
- 插入和删除：$O(N)$ 时间，且涉及大量数据移动

---

**实现方式2：链表（Linked Lists）**

结点结构：地址 + 数据 + 指针

示例数据：
| 地址 | 数据 | 指针 |
|------|------|------|
| 0010 | SUN  | 1011 |
| 0011 | QIAN | 0010 |
| 0110 | ZHAO | 0011 |
| 1011 | LIN  | NULL |

连接 ZHAO 和 QIAN 的操作顺序问题：
- 若顺序颠倒会怎样？
- 如何插入新的首结点？
- 如何删除首结点？可以通过添加哑头结点（dummy head node）解决。

---

**多项式ADT（The Polynomial ADT）**

**对象**：$P(x) = a_1 x^{e_1} + \dots + a_n x^{e_n}$，一组有序对 $<e_i, a_i>$，其中 $a_i$ 为系数，$e_i$ 为指数（非负整数）。

**操作**：求多项式的次数、加法、减法、乘法、求导。

**表示法1**（数组）：
```c
typedef struct {
    int CoeffArray[MaxDegree + 1];
    int HighPower;
} *Polynomial;
```
缺点：对稀疏多项式（如 $10x^{1000} + 5x^{14} + 1$ 和 $3x^{1990} - 2x^{1492} + 11x + 5$）浪费空间。

**表示法2**（链表）：
```c
typedef struct poly_node *poly_ptr;
struct poly_node {
    int Coefficient; /* assume coefficients are integers */
    int Exponent;
    poly_ptr Next;
};
typedef poly_ptr a; /* nodes sorted by exponent */
```
每个结点表示一项，按指数降序排列。

---

**应用示例**：40000名学生和2500门课程
- 打印每门课的学生名单
- 打印每个学生的选课列表

表示法1：`int Array[40000][2500];`  Array[i][j] = 1 表示学生 i 选修课程 j，否则为 0

---

#### 3. 链表的游标实现（Cursor Implementation of Linked Lists，无指针）

链表必须具有的特征：
a) 数据存储在一组结构体中，每个结构体包含数据和指向下一个结构体的指针。
b) 新结构体可通过 malloc 从系统全局内存获取，通过 free 释放。

**malloc 实现**：
```c
p = CursorSpace[0].Next;
CursorSpace[0].Next = CursorSpace[p].Next;
```

**free(p) 实现**：
```c
CursorSpace[p].Next = CursorSpace[0].Next;
CursorSpace[0].Next = p;
```

注意：游标实现的接口与指针实现完全相同。由于没有内存管理例程的开销，游标实现通常显著更快。

---

### 第3章 栈与队列（Stack and Queue）

#### 3. 栈ADT（The Stack ADT）

**定义**：栈是一种后进先出（Last-In-First-Out, LIFO）的表，即只能在栈顶进行插入和删除操作的有序表。

**对象**：包含零个或多个元素的有序有限表。

**操作**：
- `int IsEmpty(Stack S);`
- `Stack CreateStack();`
- `DisposeStack(Stack S);`
- `MakeEmpty(Stack S);`
- `Push(ElementType X, Stack S);`
- `ElementType Top(Stack S);`
- `Pop(Stack S);`

注意：对空栈执行 Pop 或 Top 是栈 ADT 的错误。对满栈执行 Push 是实现错误，而非 ADT 错误。

---

**链表实现（带头结点）**：
- **Push**：① TmpCell->Next = S->Next；② S->Next = TmpCell
- **Top**：return S->Next->Element
- **Pop**：① FirstCell = S->Next；② S->Next = S->Next->Next；③ free(FirstCell)

**数组实现**：
```c
struct StackRecord {
    int Capacity;      /* size of stack */
    int TopOfStack;    /* the top pointer */
                       /* ++ for push, -- for pop, -1 for empty stack */
    ElementType *Array; /* array for stack elements */
};
```
注意：
① 栈模型必须良好封装，除栈操作例程外，其他代码不能访问 Array 或 TopOfStack 变量。
② Push 或 Pop(Top) 前必须进行错误检查。

---

**应用1：符号平衡（Balancing Symbols）**
检查括号 ( )、方括号 [ ] 和花括号 { } 是否平衡。$T(N) = O(N)$，无需知道优先级规则。

---

**应用2：中缀转后缀表达式（Infix to Postfix Conversion）**

示例：$a + b * c - d \rightarrow a b c * + d -$

注意：
- 操作数的顺序在中缀和后缀中相同。
- 高优先级的操作符先出现。

示例：$a * (b + c) / d \rightarrow a b c + * d /$

**处理规则**：
① 只有在处理右括号 ) 时才从栈中弹出左括号 (。
② 定义栈内优先级（in-stack precedence）和入栈优先级（incoming precedence），每次比较时使用对应的优先级。

注意：
- $a - b - c$ 转换为 $a b - c -$（左结合）。
- $2^{\wedge}2^{\wedge}3$（即 $2^{2^3}$）必须转换为 $2 2 3 \wedge \wedge$，而非 $2 2 \wedge 3 \wedge$，因为幂运算是右结合的。

---

**应用3：函数调用——系统栈（Function Calls — System Stack）**

---

#### 4. 队列ADT（The Queue ADT）

**定义**：队列是一种先进先出（First-In-First-Out, FIFO）的表，即插入在一端进行、删除在另一端进行的有序表。

**对象**：包含零个或多个元素的有序有限表。

**操作**：
- `int IsEmpty(Queue Q);`
- `Queue CreateQueue();`
- `DisposeQueue(Queue Q);`
- `MakeEmpty(Queue Q);`
- `Enqueue(ElementType X, Queue Q);`
- `ElementType Front(Queue Q);`
- `Dequeue(Queue Q);`

---

**数组实现**（链表实现较简单）：
```c
struct QueueRecord {
    int Capacity;      /* max size of queue */
    int Front;         /* the front pointer */
    int Rear;          /* the rear pointer */
    int Size;          /* Optional — the current size of queue */
    ElementType *Array; /* array for queue elements */
};
```

**示例**：操作系统中的作业调度（Job Scheduling）
- 依次入队：Job 1, Job 2, Job 3
- 出队：Job 1
- 入队：Job 4, Job 5, Job 6
- 出队：Job 2
- 入队：Job 7, Job 8

注意：添加 Size 字段可以避免浪费一个空位来区分队列"满"和"空"的状态。

---

### 第4章 二叉树（Binary Trees）

#### 1. 预备知识（Preliminaries）

**定义**：树是结点的集合。集合可以为空；否则，树由以下部分组成：
(1) 一个特殊的结点 r，称为根（root）；
(2) 以及零个或多个非空（子）树 $T_1, \dots, T_k$，每棵子树的根通过从 r 出发的有向边连接。

注意：
- 子树之间不能相互连接。因此树中的每个结点都是某棵子树的根。
- 有 N 个结点的树有 N-1 条边。
- 通常根画在顶部。

**术语**：
- **结点的度（degree of a node）**：结点的子树个数。例如 degree(A) = 3，degree(F) = 0。
- **树的度（degree of a tree）**：$\max\{\text{degree(node)}\}$
- **父结点（parent）**：具有子树的结点。
- **子结点（children）**：父结点的子树的根。
- **兄弟（siblings）**：同一父结点的子结点。
- **叶结点/终端结点（leaf / terminal node）**：度为 0 的结点（无子结点）。
- **从 n₁ 到 nₖ 的路径（path）**：唯一的结点序列 $n_1, n_2, \dots, n_k$，使得对于 $1 \le i < k$，$n_i$ 是 $n_{i+1}$ 的父结点。
- **路径长度（length of path）**：路径上的边数。
- **nᵢ 的深度（depth）**：从根到 nᵢ 的唯一路径的长度。根的深度 = 0。
- **nᵢ 的高度（height）**：从 nᵢ 到叶结点的最长路径的长度。叶结点的高度 = 0。height(D) = 2。
- **树的高度/深度（height/depth of a tree）**：根的高度 = 最深叶结点的深度。
- **结点的祖先（ancestors）**：从该结点到根的路径上的所有结点。
- **结点的后代（descendants）**：其子树中的所有结点。

---

**实现方式：列表表示（List Representation）**
注意：由于树中孩子的顺序可以是任意的，这种表示不唯一。

---

#### 2. 二叉树（Binary Trees）

**定义**：二叉树是一种树，其中任何结点都不能有多于两个子结点。

将 FirstChild-NextSibling 树顺时针旋转 45° 即可得到二叉树。

---

**表达式树（Expression Trees / Syntax Trees）**

示例：中缀表达式 $A + B * C / D$

从后缀表达式构造表达式树：
示例：$(a + b) * (c * (d + e)) = a b + c d e + * *$

---

**树的遍历（Tree Traversals）—— 恰好访问每个结点一次**

**前序遍历（Preorder Traversal）**：
```c
void preorder (tree_ptr tree) {
    if (tree) {
        visit (tree);
        for (each child C of tree)
            preorder (C);
    }
}
```

**后序遍历（Postorder Traversal）**：
```c
void postorder (tree_ptr tree) {
    if (tree) {
        for (each child C of tree)
            postorder (C);
        visit (tree);
    }
}
```

**层序遍历（Levelorder Traversal）**：
```c
void levelorder (tree_ptr tree) {
    enqueue (tree);
    while (queue is not empty) {
        visit (T = dequeue ());
        for (each child C of T)
            enqueue (C);
    }
}
```

**中序遍历（Inorder Traversal）**：
```c
void inorder (tree_ptr tree) {
    if (tree) {
        inorder (tree->Left);
        visit (tree->Element);
        inorder (tree->Right);
    }
}
```

对于表达式树：
- 中序遍历 → $A + B * C / D$
- 后序遍历 → $A B C * D / +$
- 前序遍历 → $+ A / * B C D$

**迭代版中序遍历**：
```c
void iter_inorder (tree_ptr tree) {
    Stack S = CreateStack(MAX_SIZE);
    for (;;) {
        for (; tree; tree = tree->Left)
            Push (tree, S);
        tree = Top (S);
        Pop(S);
        if (!tree) break;
        visit (tree->Element);
        tree = tree->Right;
    }
}
```

---

**应用示例**：层次化文件系统中的目录列表
- 深度为 $d_i$ 的文件将缩进 $d_i$ 个制表符。

```c
static void ListDir (DirOrFile D, int Depth) {
    if (D is a legitimate entry) {
        PrintName (D, Depth);
        if (D is a directory)
            for (each child C of D)
                ListDir (C, Depth + 1);
    }
}
```
$T(N) = O(N)$

对外接口：
```c
void ListDirectory (DirOrFile D) {
    ListDir(D, 0);
}
```
注意：Depth 是内部变量，用户不可见。

---

**线索二叉树（Threaded Binary Trees）**

**规则**：
- 规则1：若 Tree->Left 为空，将其替换为指向 Tree 的中序前驱的指针。
- 规则2：若 Tree->Right 为空，将其替换为指向 Tree 的中序后继的指针。
- 规则3：不能有任何悬空的线索。因此线索二叉树必须有一个头结点，其左子结点指向第一个结点。

**结构定义**：
```c
typedef struct ThreadedTreeNode *PtrToThreadedNode;
typedef struct PtrToThreadedNode ThreadedTree;
typedef struct ThreadedTreeNode {
    int LeftThread;     /* if it is TRUE, then Left is a thread, not a child ptr. */
    ThreadedTree Left;
    ElementType Element;
    int RightThread;    /* if it is TRUE, then Right is a thread, not a child ptr. */
    ThreadedTree Right;
}
```

---

**二叉树的性质（Properties of Binary Trees）**：
- 第 i 层的最大结点数为 $2^{i-1}$（$i \ge 1$）。
- 深度为 k 的二叉树的最大结点数为 $2^k - 1$（$k \ge 1$）。
- 对于任何非空二叉树，$n_0 = n_2 + 1$，其中 $n_0$ 为叶结点数，$n_2$ 为度为 2 的结点数。

**证明**：
设 $n_1$ 为度为 1 的结点数，n 为结点总数。
$n = n_0 + n_1 + n_2$  (1)
设 B 为分支数，则 $n = B + 1$。
所有分支来自度为 1 或 2 的结点，故 $B = n_1 + 2n_2$。
代入得 $n_0 = n_2 + 1$。

注意：在一般树中，子结点的顺序无关紧要。但在二叉树中，左子结点和右子结点是不同的。

---

### 第3章（续） 二叉搜索树（Binary Search Trees）

#### 1. 定义

**定义**：二叉搜索树是一棵二叉树，可以为空。若非空，则满足以下性质：
(1) 每个结点有一个整数键值，且键值互不相同。
(2) 非空左子树中的所有键值必须小于该子树根结点的键值。
(3) 非空右子树中的所有键值必须大于该子树根结点的键值。
(4) 左子树和右子树也是二叉搜索树。

---

#### 2. ADT 操作

```c
SearchTree MakeEmpty(SearchTree T);
Position Find(ElementType X, SearchTree T);
Position FindMin(SearchTree T);
Position FindMax(SearchTree T);
SearchTree Insert(ElementType X, SearchTree T);
SearchTree Delete(ElementType X, SearchTree T);
ElementType Retrieve(Position P);
```

---

#### 3. 实现

**Find（迭代版）**：
```c
Position Iter_Find(ElementType X, SearchTree T) {
    /* iterative version of Find */
    while (T) {
        if (X == T->Element)
            return T; /* found */
        if (X < T->Element)
            T = T->Left; /* move down along left path */
        else
            T = T->Right; /* move down along right path */
    } /* end while-loop */
    return NULL; /* not found */
}
```
$T(N) = O(d)$，其中 d 为深度。

**FindMin**：
```c
Position FindMin(SearchTree T) {
    if (T == NULL)
        return NULL; /* not found in an empty tree */
    else if (T->Left == NULL)
        return T; /* found left most */
    else
        return FindMin(T->Left); /* keep moving to left */
}
```

**FindMax**：
```c
Position FindMax(SearchTree T) {
    if (T != NULL)
        while (T->Right != NULL)
            T = T->Right; /* keep moving to find right most */
    return T; /* return NULL or the right most */
}
```

**Insert**：
```c
SearchTree Insert(ElementType X, SearchTree T) {
    if (T == NULL) { /* Create and return a one-node tree */
        T = malloc(sizeof(struct TreeNode));
        if (T == NULL)
            FatalError("Out of space!!!");
        else {
            T->Element = X;
            T->Left = T->Right = NULL;
        }
    } /* End creating a one-node tree */
    else /* If there is a tree */
        if (X < T->Element)
            T->Left = Insert(X, T->Left);
        else if (X > T->Element)
            T->Right = Insert(X, T->Right);
    /* Else X is in the tree already; we'll do nothing */
    return T; /* Do not forget this line!! */
}
```

**Delete**：
- 删除叶结点：直接删除。
- 删除度为 1 的结点：用其子结点替换。
- 删除度为 2 的结点：
  ① 用左子树中的最大结点或右子树中的最小结点替换该结点。
  ② 从子树中删除用于替换的结点。

```c
SearchTree Delete(ElementType X, SearchTree T) {
    Position TmpCell;
    if (T == NULL)
        Error("Element not found");
    else if (X < T->Element) /* Go left */
        T->Left = Delete(X, T->Left);
    else if (X > T->Element) /* Go right */
        T->Right = Delete(X, T->Right);
    else /* Found element to be deleted */
        if (T->Left && T->Right) { /* Two children */
            /* Replace with smallest in right subtree */
            TmpCell = FindMin(T->Right);
            T->Element = TmpCell->Element;
            T->Right = Delete(T->Element, T->Right);
        } /* End if */
        else { /* One or zero child */
            TmpCell = T;
            if (T->Left == NULL) /* Also handles 0 child */
                T = T->Right;
            else if (T->Right == NULL)
                T = T->Left;
            free(TmpCell);
        } /* End else 1 or 0 child */
    return T;
}
```
$T(N) = O(h)$，其中 h 为树的高度。

**懒惰删除（Lazy Deletion）**：
如果删除操作不多，可采用懒惰删除：为每个结点添加一个标志字段，标记该结点是活跃的还是已删除。这样可以不实际释放结点空间。如果已删除的键值被重新插入，无需再次调用 malloc。
但当已删除结点数与活跃结点数相当时，是否会影响操作效率？

---

#### 4. 平均情况分析

**问题**：将 n 个元素放入二叉搜索树，树可以有多高？
**答案**：高度取决于插入顺序。

示例：给定元素 1, 2, 3, 4, 5, 6, 7。
- 插入顺序：4, 2, 1, 3, 6, 5, 7 → h = 2
- 插入顺序：1, 2, 3, 4, 5, 6, 7 → h = 6（退化为链表）

---

### 第5章 优先队列/堆（Priority Queues / Heaps）

#### §1 ADT模型

**对象**：包含零个或多个元素的有序有限表。

**操作**：
```c
PriorityQueue Initialize(int MaxElements);
void Insert(ElementType X, PriorityQueue H);
ElementType DeleteMin(PriorityQueue H);
ElementType FindMin(PriorityQueue H);
```
功能：删除具有最高/最低优先级的元素。

---

#### §2 简单实现

**数组（Array）**：
- 插入：在末尾添加一项 $\sim \Theta(1)$
- 删除：查找最大/最小键值 $\sim \Theta(n)$，移除元素并移动数组 $\sim O(n)$

**链表（Linked List）**：
- 插入：添加到链表头部 $\sim \Theta(1)$
- 删除：查找最大/最小键值 $\sim \Theta(n)$，移动元素 $\sim \Theta(1)$

**有序数组（Ordered Array）**：
- 插入：找到合适位置 $\sim O(n)$，添加元素 $\sim \Theta(1)$
- 删除：移除第一个/最后一个元素 $\sim \Theta(1)$

**有序链表（Ordered Linked List）**：
- 插入：找到合适位置 $\sim O(n)$，添加元素 $\sim \Theta(1)$
- 删除：移除第一个/最后一个元素 $\sim \Theta(1)$

由于删除操作永远不会多于插入操作，有序结构可能更好。

---

#### §3 二叉堆（Binary Heap）

**1. 结构性质（Structure Property）**

**定义**：有 n 个结点、高度为 h 的二叉树是完全的（complete），当且仅当其结点对应于高度为 h 的完美二叉树中从 1 到 n 编号的结点。

高度为 h 的完全二叉树的结点数在 $2^h$ 到 $2^{h+1} - 1$ 之间。$h = \lfloor \log N \rfloor$

**数组表示**：BT[n+1]（BT[0] 不使用）

| BT | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|----|---|---|---|---|---|---|---|
|    |   | A | B | C | D | E | F |

| 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|---|---|---|----|----|----|----|
| G | H | I | J  |    |    |    |

**引理**：若一棵有 n 个结点的完全二叉树顺序表示，则对于索引为 i（$1 \le i \le n$）的任意结点，有：
(1) parent(i) 的索引 = $\lfloor i/2 \rfloor$（若 i ≠ 1）；若 i = 1 则无父结点。
(2) left_child(i) 的索引 = 2i（若 2i ≤ n）；若 2i > n 则无左子结点。
(3) right_child(i) 的索引 = 2i + 1（若 2i + 1 ≤ n）；若 2i + 1 > n 则无右子结点。

**初始化**：
```c
PriorityQueue Initialize(int MaxElements) {
    PriorityQueue H;
    if (MaxElements < MinPQSize)
        return Error("Priority queue size is too small");
    H = malloc(sizeof(struct HeapStruct));
    if (H == NULL)
        return FatalError("Out of space!!!");
    /* Allocate the array plus one extra for sentinel */
    H->Elements = malloc((MaxElements + 1) * sizeof(ElementType));
    if (H->Elements == NULL)
        return FatalError("Out of space!!!");
    H->Capacity = MaxElements;
    H->Size = 0;
    H->Elements[0] = MinData; /* set the sentinel */
    return H;
}
```

---

**2. 堆序性质（Heap Order Property）**

**定义**：最小树（min tree）是每个结点的键值不大于其子结点（如果有）键值的树。最小堆（min heap）是满足最小树性质的完全二叉树。
注意：类似地，可以改变堆序性质来定义最大堆（max heap）。

---

**3. 基本堆操作**

**插入（Insert）**：
```c
/* H->Element[0] is a sentinel */
void Insert(ElementType X, PriorityQueue H) {
    int i;
    if (IsFull(H)) {
        Error("Priority queue is full");
        return;
    }
    for (i = ++H->Size; H->Elements[i / 2] > X; i /= 2)
        H->Elements[i] = H->Elements[i / 2];
    H->Elements[i] = X;
}
```
$T(N) = O(\log N)$

H->Element[0] 是哨兵（sentinel），其值不大于堆中最小元素。这种方法比交换（swap）更快。

**删除最小值（DeleteMin）**：
```c
ElementType DeleteMin(PriorityQueue H) {
    int i, Child;
    ElementType MinElement, LastElement;
    if (IsEmpty(H)) {
        Error("Priority queue is empty");
        return H->Elements[0];
    }
    MinElement = H->Elements[1]; /* save the min element */
    LastElement = H->Elements[H->Size--]; /* take last and reset size */
    for (i = 1; i * 2 <= H->Size; i = Child) {
        /* Find smaller child */
        Child = i * 2;
        if (Child != H->Size && H->Elements[Child + 1] < H->Elements[Child])
            Child++;
        if (LastElement > H->Elements[Child]) /* Percolate one level */
            H->Elements[i] = H->Elements[Child];
        else
            break; /* find the proper position */
    }
    H->Elements[i] = LastElement;
    return MinElement;
}
```
$T(N) = O(\log N)$

---

**4. 其他堆操作**

注意：查找除最小值外的任何键值都需要线性扫描整个堆。

- **DecreaseKey(P, Δ, H)**：将堆 H 中位置 P 的键值减少正数 Δ → 上滤（percolate up）。使程序能以最高优先级运行。
- **IncreaseKey(P, Δ, H)**：将堆 H 中位置 P 的键值增加正数 Δ → 下滤（percolate down）。降低占用过多 CPU 时间的进程的优先级。
- **Delete(P, H)**：先 DecreaseKey(P, ∞, H)，再 DeleteMin(H)。删除被用户（异常）终止的进程。

---

**定理**：对于高度为 h、包含 $2^{h+1} - 1$ 个结点的完美二叉树，所有结点的高度之和为 $2^{h+1} - 1 - (h+1)$。
$T(N) = O(N)$（建堆复杂度）

---

#### §4 优先队列的应用

**示例**：给定 N 个元素的列表和一个整数 k，找出第 k 大的元素。
可以想到多少种方法？各自的复杂度是多少？

---

#### §5 d-堆（d-Heaps）—— 所有结点都有 d 个子结点

**问题**：是否应将 d 设得尽可能大？

注意：
① DeleteMin 需要 d-1 次比较来找到最小的子结点。因此总时间复杂度为 $O(d \log_d N)$。
② *2 或 /2 只是位移操作，但 *d 或 /d 不是。
③ 当优先队列太大无法完全放入主存时，d-堆会变得有意义。

---

### 第8章 并查集（Union and Find）

#### 1. 等价关系（Equivalence Relations）

**定义**：关系 R 定义在集合 S 上，若对于每对元素 (a, b)（a, b ∈ S），a R b 要么为真要么为假。若 a R b 为真，则称 a 与 b 相关。

**定义**：集合 S 上的关系 $\sim$ 称为等价关系，当且仅当它在 S 上满足对称性（symmetric）、自反性（reflexive）和传递性（transitive）。

**定义**：集合 S 的两个成员 x 和 y 属于同一等价类，当且仅当 $x \sim y$。

---

#### 2. 动态等价问题（The Dynamic Equivalence Problem）

给定等价关系 $\sim$，判断任意 a 和 b 是否有 $a \sim b$。

**示例**：给定 S = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12} 和 9 个关系：
12 = 4, 3 = 1, 6 = 10, 8 = 9, 7 = 4, 6 = 8, 3 = 5, 2 = 11, 11 = 12。
等价类为：{2, 4, 7, 11, 12}, {1, 3, 5}, {6, 8, 9, 10}。

**算法（Union/Find）**：
```c
/* step 1: read the relations in */
Initialize N disjoint sets;
while (read in a ~ b) {
    if (!(Find(a) == Find(b)))
        Union the two sets;
} /* end-while */
/* step 2: decide if a ~ b */
while (read in a and b)
    if (Find(a) == Find(b))
        output(true);
    else
        output(false);
```

---

#### 3. 基本数据结构

集合元素：1, 2, 3, ..., N
集合：$S_1, S_2, \ldots$ 且 $S_i \cap S_j = \emptyset$（若 i ≠ j）—— 互不相交（disjoint）

示例：$S_1 = \{6, 7, 8, 10\}, S_2 = \{1, 4, 9\}, S_3 = \{2, 3, 5\}$

**操作**：
(1) Union(i, j)：将 $S_i$ 和 $S_j$ 替换为 $S = S_i \cup S_j$
(2) Find(i)：找出包含元素 i 的集合 $S_k$

**Union(i, j) 思路**：使 $S_i$ 成为 $S_j$ 的子树，或反之。即将其中一个根的父指针指向另一个根。

**实现1**：S[element] = 该元素的父结点。
注意：S[root] = 0，集合名 = 根索引。

**Find 实现**：
```c
SetType Find(ElementType X, DisjSet S) {
    for (; S[X] > 0; X = S[X]);
    return X;
}
```

**分析**：以下操作序列会导致 $T = \Theta(N^2)$：
union(2, 1), find(1);
union(3, 2), find(1);
...
union(N, N-1), find(1);

---

#### 4. 智能合并算法（Smart Union Algorithms）

**按大小合并（Union-by-Size）**—— 总是将较小的树挂到较大的树上。
S[Root] = -size; /* 初始化为 -1 */

**引理**：设 T 是由按大小合并创建的具有 N 个结点的树，则树的高度不超过 $\lfloor \log_2 N \rfloor$。
