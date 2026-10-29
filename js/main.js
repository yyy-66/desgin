/* ============================================================
   林屿设计 · 作品集交互脚本
   功能：进场动画 / 导航滚动态 / 作品筛选 / 项目详情浮层
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 项目数据（与 index.html 中的卡片一一对应） ---------- */
  var projects = [
    {
      title: "洄光之宅",
      meta: "住宅空间 · 北京 · 156㎡ · 2025 · 全案设计",
      desc: "一套朝南的三居室改造。拆除原有封闭隔墙，以一条贯穿客厅的「光廊」重组公共区域，让自然光成为空间的主角。材料上选用洞石、橡木与微水泥，营造安静而温润的日常氛围。",
      img: "images/project-01.png"
    },
    {
      title: "栖木",
      meta: "住宅空间 · 杭州 · 98㎡ · 2024 · 全案设计",
      desc: "为一位独居插画师打造的居所。卧室以整面橡木护墙板围合出包裹感，亚麻织物与和纸灯柔化了光的质地。设计刻意保留了适度的「留白」，给居住者的生活与创作留出余地。",
      img: "images/project-02.png"
    },
    {
      title: "石语",
      meta: "住宅空间 · 上海 · 130㎡ · 2024 · 硬装+软装",
      desc: "老房焕新的核心是把原本昏暗的北向厨房打开。中岛以一整块天然大理石制成，纹理成为空间唯一的装饰。胡桃木柜体与黑色五金形成克制的对比，让材料自己「说话」。",
      img: "images/project-03.png"
    },
    {
      title: "空谷",
      meta: "住宅空间 · 成都 · 42㎡ · 2023 · 茶室改造",
      desc: "把阳台改造成一方 42㎡ 的茶室。艺术涂料墙面在光线下呈现细腻的手工肌理，矮桌、干枝与陶器构成极简的陈设。这是一个可以「安静下来」的角落。",
      img: "images/project-04.png"
    },
    {
      title: "山·halo",
      meta: "商业空间 · 深圳 · 260㎡ · 2025 · 餐厅设计",
      desc: "一家融合菜餐厅。弧形卡座以赭红色皮革包覆，木格栅吊顶柔化了设备的存在感。黄铜吊灯在夜晚营造出恰到好处的温度，让「吃饭」变成一场放松的仪式。",
      img: "images/project-05.png"
    },
    {
      title: "沐石",
      meta: "住宅空间 · 苏州 · 76㎡ · 2023 · 卫浴改造",
      desc: "主卫改造为酒店级的浴室体验。大面积洞石从墙面延伸至地面，独立椭圆浴缸置于天窗之下，泡澡时可以看到天光的变化。黄铜五金随时间会慢慢氧化出岁月感。",
      img: "images/project-06.png"
    }
  ];

  /* ---------- 进场动画（IntersectionObserver） ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 导航滚动态 ---------- */
  var header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }, { passive: true });

  /* ---------- 移动端菜单 ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.querySelector(".site-nav");
  menuToggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("is-open"); });
  });

  /* ---------- 作品筛选 ---------- */
  var filterBtns = document.querySelectorAll(".filter");
  var cards = document.querySelectorAll(".work-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var f = btn.dataset.filter;
      cards.forEach(function (card) {
        var show = f === "all" || card.dataset.category === f;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------- 项目详情浮层 ---------- */
  var overlay = document.getElementById("projectOverlay");
  var overlayImg = document.getElementById("overlayImg");
  var overlayTitle = document.getElementById("overlayTitle");
  var overlayMeta = document.getElementById("overlayMeta");
  var overlayDesc = document.getElementById("overlayDesc");
  var overlayNo = document.getElementById("overlayNo");
  var current = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function showProject(i) {
    current = (i + projects.length) % projects.length;
    var p = projects[current];
    overlayImg.src = p.img;
    overlayImg.alt = p.title;
    overlayTitle.textContent = p.title;
    overlayMeta.textContent = p.meta;
    overlayDesc.textContent = p.desc;
    overlayNo.textContent = pad(current + 1) + " / " + pad(projects.length);
    overlay.querySelector(".overlay-body").scrollTop = 0;
  }

  function openOverlay(i) {
    showProject(i);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeOverlay() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      openOverlay(parseInt(card.dataset.index, 10));
    });
  });

  document.getElementById("overlayClose").addEventListener("click", closeOverlay);
  document.getElementById("overlayPrev").addEventListener("click", function () { showProject(current - 1); });
  document.getElementById("overlayNext").addEventListener("click", function () { showProject(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") closeOverlay();
    if (e.key === "ArrowLeft") showProject(current - 1);
    if (e.key === "ArrowRight") showProject(current + 1);
  });

})();
