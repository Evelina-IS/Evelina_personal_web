document$.subscribe(({ body }) => {
  // 先将所有 $$...$$ 块保护起来
  const content = body.innerHTML;
  
  // 替换已经被 p 标签包裹的公式
  body.innerHTML = content.replace(/<p>\s*\$\$([\s\S]*?)\$\$\s*<\/p>/g, (match, formula) => {
    return `<div class="arithmatex">\\[${formula}\\]</div>`;
  });
  
  // 渲染数学公式
  renderMathInElement(body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false},
      {left: '\\[', right: '\\]', display: true},
      {left: '\\(', right: '\\)', display: false}
    ],
    throwOnError: false,
    strict: false,
    trust: true
  });
});