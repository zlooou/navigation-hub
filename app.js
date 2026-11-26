const DEFAULT_BOOKMARKS = [
  {id:'figma',title:'Figma',url:'https://www.figma.com',category:'设计',description:'把灵感变成作品',initial:'F',iconBg:'#30283f',iconColor:'#d1aaff'},
  {id:'dribbble',title:'Dribbble',url:'https://dribbble.com',category:'设计',description:'设计灵感与作品集',initial:'D',iconBg:'#402a35',iconColor:'#ff9cbd'},
  {id:'github',title:'GitHub',url:'https://github.com',category:'开发',description:'构建、协作与分享',initial:'⌘',iconBg:'#2b2c31',iconColor:'#eeeeec'},
  {id:'linear',title:'Linear',url:'https://linear.app',category:'开发',description:'让项目管理更专注',initial:'L',iconBg:'#292740',iconColor:'#b9adff'},
  {id:'notion',title:'Notion',url:'https://www.notion.so',category:'工作',description:'笔记、文档与计划',initial:'N',iconBg:'#30302d',iconColor:'#f6f5f0'},
  {id:'youtube',title:'YouTube',url:'https://www.youtube.com',category:'娱乐',description:'值得一看的内容',initial:'▶',iconBg:'#41292a',iconColor:'#ff8c8c'},
  {id:'readwise',title:'Readwise Reader',url:'https://readwise.io/read',category:'阅读',description:'把阅读收集在一起',initial:'R',iconBg:'#273a37',iconColor:'#92d8c6'},
  {id:'unsplash',title:'Unsplash',url:'https://unsplash.com',category:'设计',description:'免费的灵感与影像',initial:'U',iconBg:'#30302d',iconColor:'#fff'}
];
const DEFAULT_CATEGORIES = ['设计','开发','工作','阅读','娱乐'];
const FEED_ITEMS = [
  {source:'设计周刊',icon:'D',title:'设计系统的边界：为变化而设计',time:'12 分钟前',color:'#bea4fb'},
  {source:'少数派',icon:'少',title:'给数字生活做一次轻量整理',time:'1 小时前',color:'#f9a675'},
  {source:'阮一峰的网络日志',icon:'阮',title:'本周值得关注的开源项目',time:'昨天',color:'#93b7ff'}
];
const read = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
let bookmarks = read('orbit-bookmarks', DEFAULT_BOOKMARKS);
let categories = read('orbit-categories', DEFAULT_CATEGORIES);
let activeCategory = '全部';
let currentView = 'home';
let toastTimer;
const $ = (selector) => document.querySelector(selector);
const grid = $('#bookmark-grid');
const iconPalette = [['#323b2a','#d5edaa'],['#332d43','#c9b8ff'],['#3c2b31','#ffb3bb'],['#29383b','#a7dce0'],['#3b3426','#f4cf8b']];
function esc(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function save(){localStorage.setItem('orbit-bookmarks',JSON.stringify(bookmarks));localStorage.setItem('orbit-categories',JSON.stringify(categories));}
function renderCategories(){
  const counts = Object.fromEntries(categories.map(cat=>[cat,bookmarks.filter(item=>item.category===cat).length]));
  $('#category-nav').innerHTML = categories.map((cat,index)=>`<button class="category-item ${activeCategory===cat?'selected':''}" data-category="${esc(cat)}"><span class="category-dot" style="--dot:${iconPalette[index%iconPalette.length][1]}"></span>${esc(cat)}<span class="category-num">${counts[cat]||0}</span></button>`).join('');
  $('#site-category').innerHTML = categories.map(cat=>`<option value="${esc(cat)}">${esc(cat)}</option>`).join('') + '<option value="新建分类">＋ 新建分类…</option>';
  $('#bookmark-count').textContent=bookmarks.length;
}
function renderBookmarks(){
  const query=$('#search-input').value.trim().toLowerCase();
  const isSaved=currentView==='saved';
  const filtered=bookmarks.filter(item=>{
    const matchesCategory=activeCategory==='全部'||item.category===activeCategory;
    const matchesQuery=!query||[item.title,item.url,item.description,item.category].join(' ').toLowerCase().includes(query);
    return matchesCategory&&matchesQuery;
  });
  $('#section-title').textContent=isSaved?'我的收藏':currentView==='category'?activeCategory:'常用网站';
  $('#visible-count').textContent=filtered.length?`· ${filtered.length}`:'';
  $('#breadcrumb-title').textContent=isSaved?'我的收藏':currentView==='category'?activeCategory:currentView==='feeds'?'资讯订阅':'首页';
  grid.innerHTML=filtered.map((item,index)=>{
    const colors=item.iconBg?`--icon-bg:${item.iconBg};--icon-color:${item.iconColor||'#fff'}`:`--icon-bg:${iconPalette[index%iconPalette.length][0]};--icon-color:${iconPalette[index%iconPalette.length][1]}`;
    const initial=item.initial||item.title.slice(0,1).toUpperCase();
    return `<article class="bookmark-card" data-id="${esc(item.id)}"><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${esc(item.title)}"><div class="bookmark-top"><span class="site-icon" style="${colors}">${esc(initial)}</span><button class="card-more" data-delete="${esc(item.id)}" title="删除网址" aria-label="删除 ${esc(item.title)}">···</button></div><h3 class="bookmark-title">${esc(item.title)}</h3><p class="bookmark-desc">${esc(item.description||item.url.replace(/^https?:\/\//,''))}</p><span class="card-category">${esc(item.category)}</span></a></article>`;
  }).join('');
  $('#empty-state').classList.toggle('hidden',filtered.length>0);
  $('#bookmark-grid').classList.toggle('hidden',filtered.length===0);
  $('#clear-search').style.display=query?'block':'none';
  renderCategories();
}
function renderFeeds(){
  $('#feed-list').innerHTML=FEED_ITEMS.map(item=>`<div class="feed-row"><span class="feed-source-icon" style="color:${item.color}">${esc(item.icon)}</span><div class="feed-text"><div class="feed-source">${esc(item.source)}</div><div class="feed-title">${esc(item.title)}</div></div><span class="feed-time">${esc(item.time)}</span></div>`).join('');
}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400);}
function openBookmarkModal(){ $('#bookmark-modal').showModal(); $('#site-title').focus(); }
function setView(view){currentView=view;activeCategory=view==='category'?activeCategory:'全部';document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.view===view));renderBookmarks();if(view==='feeds')$('#feeds-modal').showModal();window.scrollTo({top:0,behavior:'smooth'});}
const date=new Date();$('#date-display').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(date);
const hour=date.getHours();$('#greeting').innerHTML=`${hour<11?'��上好':hour<18?'下午好':'晚上好'}<span class="wave">✳</span>`;
renderBookmarks();renderFeeds();
document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$('#category-nav').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;currentView='category';document.querySelectorAll('.nav-item').forEach(item=>item.classList.remove('active'));renderBookmarks();});
$('#search-input').addEventListener('input',renderBookmarks);
$('#clear-search').addEventListener('click',()=>{$('#search-input').value='';renderBookmarks();$('#search-input').focus();});
document.querySelectorAll('.quick-hints button').forEach(button=>button.addEventListener('click',()=>{$('#search-input').value=button.dataset.query;renderBookmarks();$('#search-input').focus();}));
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#search-input').focus();}if(event.key==='Escape')document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());});
$('#open-add').addEventListener('click',openBookmarkModal);$('#empty-add').addEventListener('click',openBookmarkModal);
$('#bookmark-form').addEventListener('submit',event=>{
  if(event.submitter?.value==='cancel')return;
  event.preventDefault();const title=$('#site-title').value.trim();let url=$('#site-url').value.trim();let category=$('#site-category').value;
  if(!/^https?:\/\//i.test(url))url='https://'+url;
  try{new URL(url);}catch{showToast('请输入有效的网址');return;}
  if(category==='新建分类'){const next=prompt('输入新分类名称');if(!next?.trim()){showToast('已取消添加');return;}category=next.trim();if(!categories.includes(category))categories.push(category);}
  bookmarks.unshift({id:crypto.randomUUID?.()||String(Date.now()),title,url,category,description:$('#site-description').value.trim(),initial:title.slice(0,1).toUpperCase()});save();$('#bookmark-modal').close();$('#bookmark-form').reset();activeCategory='全部';currentView='home';renderBookmarks();showToast('网址已添加到你的空间');
});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-delete]');if(!button)return;event.preventDefault();event.stopPropagation();const item=bookmarks.find(bookmark=>bookmark.id===button.dataset.delete);if(!item)return;if(confirm(`删除「${item.title}」？`)){bookmarks=bookmarks.filter(bookmark=>bookmark.id!==item.id);save();renderBookmarks();showToast('网址已删除');}});
$('#manage-bookmarks').addEventListener('click',()=>{setView('saved');showToast('显示全部已收藏网址');});
$('#add-category').addEventListener('click',()=>{const name=prompt('新分类名称');if(!name?.trim())return;if(categories.includes(name.trim())){showToast('这个分类已经存在');return;}categories.push(name.trim());save();renderBookmarks();showToast('分类已添加');});
$('#privacy-toggle').addEventListener('click',()=>{const button=$('#privacy-toggle');const on=button.classList.toggle('on');document.body.classList.toggle('privacy-mode',on);button.setAttribute('aria-pressed',String(on));showToast(on?'本地隐私模式已开启：广告已隐藏':'本地隐私模式已关闭');});
$('#theme-toggle').addEventListener('click',()=>{document.body.classList.toggle('light-theme');localStorage.setItem('orbit-theme',document.body.classList.contains('light-theme')?'light':'dark');});
if(localStorage.getItem('orbit-theme')==='light')document.body.classList.add('light-theme');
$('#feed-refresh').addEventListener('click',event=>{event.currentTarget.style.transform='rotate(360deg)';setTimeout(()=>event.currentTarget.style.transform='',350);showToast('演示订阅已更新');});
$('#open-feeds').addEventListener('click',()=>$('#feeds-modal').showModal());
$('#mobile-menu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
document.addEventListener('click',event=>{if(window.innerWidth<=820&&!event.target.closest('#sidebar')&&!event.target.closest('#mobile-menu'))$('#sidebar').classList.remove('open');});
$('#profile-button').addEventListener('click',()=>showToast('当前为无需登录的本地体验模式'));
$('#ad-link').addEventListener('click',event=>{event.preventDefault();showToast('这是示例广告位，可替换为你的广告链接');});
