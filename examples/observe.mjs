// Real browser smoke only: one newly created page, no existing private tabs.
const task=await taskSpace('ego-chrome-colleague-smoke');
const page=task.page('p1');
await page.goto('https://example.com');
console.log({spaceId:task.spaceId,page:page.label,url:await page.url()});
console.log(await page.snapshot());
await task.finish({keep:[]});
