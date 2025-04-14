// 存储和获取链接数据
const STORAGE_KEY = 'navigation_links';

let links = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// DOM 元素
const modal = document.getElementById('addLinkModal');
const editModal = document.getElementById('editLinkModal');
// 移除这行
const addLinkBtn = document.getElementById('addLinkBtn');

const closeBtn = document.querySelector('.close');
const editCloseBtn = document.querySelector('#editLinkModal .close');
const addLinkForm = document.getElementById('addLinkForm');
const editLinkForm = document.getElementById('editLinkForm');
const linksGrid = document.getElementById('linksGrid');

// 全局事件监听器，只需注册一次
document.addEventListener('click', function() {
    // 关闭所有打开的移动端菜单
    document.querySelectorAll('.mobile-edit-menu').forEach(menu => {
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
            // 找到相应的链接并恢复
            const linkCard = menu.closest('.link-card');
            if (linkCard) {
                const index = parseInt(linkCard.dataset.index);
                const link = links[index];
                const linkAnchor = linkCard.querySelector('a');
                if (linkAnchor && link) {
                    linkAnchor.href = link.url;
                }
            }
        }
    });
});

// 显示所有链接
function displayLinks() {
    linksGrid.innerHTML = '';
    links.forEach((link, index) => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card';
        linkCard.dataset.index = index;
        linkCard.innerHTML = `
            <a href="${link.url}" target="_blank">
                <img src="${link.icon || 'https://www.google.com/s2/favicons?domain=' + new URL(link.url).hostname}" 
                     alt="${link.title}" 
                     onerror="this.src='https://via.placeholder.com/32'">
                <p>${link.title}</p>
            </a>
            <div class="edit-buttons">
                <div class="edit-menu">
                    <div class="edit-menu-item edit-link" data-index="${index}">编辑</div>
                    <div class="edit-menu-item delete-link" data-index="${index}">删除</div>
                </div>
            </div>
            <div class="mobile-edit-menu" style="display:none;">
                <div class="edit-menu-item edit-link-mobile" data-index="${index}">编辑</div>
                <div class="edit-menu-item delete-link-mobile" data-index="${index}">删除</div>
            </div>
        `;
        
        // 添加编辑功能
        const editBtns = linkCard.querySelector('.edit-buttons');
        if (editBtns) {
            const editLink = editBtns.querySelector('.edit-link');
            const deleteLink = editBtns.querySelector('.delete-link');
            
            // 阻止编辑按钮触发链接点击事件
            editBtns.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            // 编辑链接
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(editLink.dataset.index);
                openEditModal(index);
            });
            
            // 删除链接
            deleteLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(deleteLink.dataset.index);
                if (confirm('确定要删除此链接吗？')) {
                    links.splice(index, 1);
                    saveLinks();
                    displayLinks();
                }
            });
        }
        
        // 添加移动端长按功能
        const linkImg = linkCard.querySelector('img');
        const linkAnchor = linkCard.querySelector('a');
        const mobileEditMenu = linkCard.querySelector('.mobile-edit-menu');
        
        let longPressTimer;
        
        // 长按开始
        linkImg.addEventListener('touchstart', function(e) {
            // 设置长按定时器
            longPressTimer = setTimeout(function() {
                // 显示移动端编辑菜单
                mobileEditMenu.style.display = 'flex';
                // 阻止链接导航
                linkAnchor.href = 'javascript:void(0);';
                
                // 阻止默认行为和冒泡
                e.preventDefault();
                e.stopPropagation();
            }, 600); // 长按600毫秒
        }, { passive: false }); // 改为非被动模式，以便可以阻止默认行为
        
        // 触摸移动或结束时清除定时器
        linkImg.addEventListener('touchmove', function() {
            clearTimeout(longPressTimer);
        });
        
        linkImg.addEventListener('touchend', function() {
            clearTimeout(longPressTimer);
        });
        
        // 给移动端按钮添加事件，直接使用touchend事件而不是click
        const editLinkMobile = linkCard.querySelector('.edit-link-mobile');
        const deleteLinkMobile = linkCard.querySelector('.delete-link-mobile');
        
        if (editLinkMobile) {
            editLinkMobile.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 隐藏菜单
                mobileEditMenu.style.display = 'none';
                
                // 恢复链接功能
                linkAnchor.href = link.url;
                
                // 打开编辑模态框
                const index = parseInt(this.dataset.index);
                openEditModal(index);
            });
            
            // 也保留点击事件以兼容所有设备
            editLinkMobile.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        
        if (deleteLinkMobile) {
            deleteLinkMobile.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 隐藏菜单
                mobileEditMenu.style.display = 'none';
                
                // 恢复链接功能
                linkAnchor.href = link.url;
                
                // 删除链接
                const index = parseInt(this.dataset.index);
                if (confirm('确定要删除此链接吗？')) {
                    links.splice(index, 1);
                    saveLinks();
                    displayLinks();
                }
            });
            
            // 也保留点击事件以兼容所有设备
            deleteLinkMobile.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        
        // 阻止移动菜单冒泡点击和触摸事件
        mobileEditMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        mobileEditMenu.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });
        
        // 添加右键菜单
        linkCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm('是否删除此链接？')) {
                links.splice(index, 1);
                saveLinks();
                displayLinks();
            }
        });
        
        linksGrid.appendChild(linkCard);
    });
    
    // 修改添加按钮的样式
    const addCard = document.createElement('div');
    addCard.className = 'add-link-card';
    addCard.innerHTML = `
        <p>添加网站</p>
    `;
    addCard.onclick = () => {
        modal.style.display = 'block';
    };
    linksGrid.appendChild(addCard);
    
    initDragAndDrop();
}

// 打开编辑模态框
function openEditModal(index) {
    const link = links[index];
    document.getElementById('editLinkIndex').value = index;
    document.getElementById('editLinkTitle').value = link.title;
    document.getElementById('editLinkUrl').value = link.url;
    document.getElementById('editLinkIcon').value = link.icon || '';
    
    editModal.style.display = 'block';
}

// 添加保存静态页面功能
document.getElementById('savePageBtn').addEventListener('click', function() {
    const staticHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>一心的宇宙导航</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        body {
            font-family: 'Noto Sans SC', 'Segoe UI', Arial, sans-serif;
            background-color: #121212;
            background-image: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
            line-height: 1.6;
            color: #e0e0e0;
            min-height: 100vh;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        /* 搜索框样式 */
        .search-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin: 30px auto 40px;
            max-width: 800px;
        }
        @media (min-width: 768px) {
            .search-container {
                flex-direction: row;
                justify-content: center;
                gap: 20px;
            }
        }
        .search-box {
            flex: 1;
        }
        .search-box form {
            display: flex;
            gap: 10px;
        }
        .search-box input {
            flex: 1;
            padding: 12px 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            background: rgba(34, 34, 34, 0.8);
            color: #e0e0e0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        .search-box button {
            padding: 12px 20px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .search-box button:hover {
            background: #5294ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
        }
        /* 链接区域样式 */
        .links-container {
            background: rgba(34, 34, 34, 0.8);
            border-radius: 12px;
            padding: 25px;
            margin-top: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        .links-header {
            text-align: center;
            margin-bottom: 25px;
        }
        .links-header h2 {
            font-size: 28px;
            font-weight: 500;
            color: #ffffff;
            position: relative;
            display: inline-block;
        }
        .links-header h2:after {
            content: '';
            position: absolute;
            width: 60px;
            height: 3px;
            background: #4285f4;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 2px;
        }
        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 25px;
            padding: 10px 10px 30px 10px;
            justify-content: center;
        }
        .link-card {
            text-align: center;
            width: 60px;
            height: 60px;
            padding: 10px;
            border-radius: 12px;
            background: rgba(51, 51, 51, 0.8);
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .link-card:hover {
            transform: translateY(-5px);
            background: #444;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .link-card img {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            pointer-events: none; /* 防止图片被选中 */
            -webkit-user-drag: none; /* 防止图片被拖拽 */
        }
        .link-card p {
            position: absolute;
            bottom: -24px;
            left: 0;
            right: 0;
            font-size: 14px;
            color: #e0e0e0;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        a {
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            -webkit-tap-highlight-color: transparent; /* 移除移动设备上的点击高亮 */
        }
        /* Footer样式 */
        footer {
            text-align: center;
            margin-top: auto;
            padding: 20px 0;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }
        /* 确保文本输入区域仍然可选择文本 */
        input, textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="search-container">
            <div class="search-box">
                <form action="https://www.google.com/search" method="get" target="_blank">
                    <input type="text" name="q" placeholder="Google搜索..." autocomplete="off">
                    <button type="submit">搜索</button>
                </form>
            </div>
            <div class="search-box">
                <form action="https://www.baidu.com/s" method="get" target="_blank">
                    <input type="text" name="wd" placeholder="百度搜索..." autocomplete="off">
                    <button type="submit">搜索</button>
                </form>
            </div>
        </div>
        <div class="links-container">
            <div class="links-header">
                <h2>一心的宇宙导航</h2>
            </div>
            <div class="links-grid">
                ${links.map(link => `
                    <div class="link-card">
                        <a href="${link.url}" target="_blank">
                            <img src="${link.icon || 'https://www.google.com/s2/favicons?domain=' + new URL(link.url).hostname}" 
                                 alt="${link.title}"
                                 draggable="false"
                                 onerror="this.src='https://via.placeholder.com/24'">
                            <p>${link.title}</p>
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
        <footer>
            <p>© 2023 一心的宇宙导航 - 简单、高效的个人导航工具</p>
        </footer>
    </div>
</body>
</html>`;

    const blob = new Blob([staticHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-navigation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 保存链接到 localStorage
function saveLinks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

// 关闭模态框
closeBtn.onclick = () => {
    modal.style.display = 'none';
}

editCloseBtn.onclick = () => {
    editModal.style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
}

// 处理表单提交
addLinkForm.onsubmit = (e) => {
    e.preventDefault();
    
    let url = document.getElementById('linkUrl').value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    const newLink = {
        title: document.getElementById('linkTitle').value,
        url: url,
        icon: document.getElementById('linkIcon').value
    };
    
    links.push(newLink);
    saveLinks();
    displayLinks();
    
    addLinkForm.reset();
    modal.style.display = 'none';
}

// 处理编辑表单提交
editLinkForm.onsubmit = (e) => {
    e.preventDefault();
    
    const index = parseInt(document.getElementById('editLinkIndex').value);
    let url = document.getElementById('editLinkUrl').value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    links[index] = {
        title: document.getElementById('editLinkTitle').value,
        url: url,
        icon: document.getElementById('editLinkIcon').value
    };
    
    saveLinks();
    displayLinks();
    
    editLinkForm.reset();
    editModal.style.display = 'none';
}

// 初始化显示
displayLinks();

// 添加拖拽排序功能
function initDragAndDrop() {
    const cards = document.querySelectorAll('.link-card');
    
    cards.forEach(card => {
        card.setAttribute('draggable', true);
        
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.dataset.index);
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            if (draggingCard !== card) {
                card.classList.add('drag-over');
            }
        });
        
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
            const dropIdx = parseInt(card.dataset.index);
            
            if (draggedIdx !== dropIdx) {
                // 重新排序数组
                const temp = links[draggedIdx];
                links.splice(draggedIdx, 1);
                links.splice(dropIdx, 0, temp);
                saveLinks();
                displayLinks();
            }
        });
    });
}