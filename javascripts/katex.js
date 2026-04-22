document$.subscribe(({ body }) => { 
  renderMathInElement(body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false},
      {left: '\\[', right: '\\]', display: true},
      {left: '\\(', right: '\\)', display: false}
    ],
    // 关键配置：忽略特定类名的元素
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    // 允许在代码块外处理 $$
    ignoredClasses: ['highlight', 'codehilite'],
    throwOnError: false
  });
});