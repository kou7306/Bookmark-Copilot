// サイドバーのHTMLを作成
const sidebar = document.createElement("div");
sidebar.id = "mySidebar";
sidebar.style.width = "250px";
sidebar.style.height = "100%";
sidebar.style.position = "fixed";
sidebar.style.top = "0";
sidebar.style.right = "0";
sidebar.style.color = "#f4f4f4";
sidebar.style.backgroundColor = "#f00";
sidebar.style.zIndex = "2147483647";
sidebar.style.overflowY = "auto";

// HTMLコンテンツをサイドバーに追加
sidebar.innerHTML = `
  <h2>Sidebar Title</h2>
  <p>This is some content in the sidebar.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
`;

// サイドバーをページに追加
document.body.appendChild(sidebar);
