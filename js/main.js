/* ============================================================
   陳浩文 · 作品集交互脚本
   功能：数据渲染 / 进场动画 / 导航滚动态 / 作品筛选 / 项目详情浮层（瀑布流）
   项目数据来自 js/projects.js（var PROJECTS = [...]）
   ============================================================ */

(function () {
  "use strict";

  var projects = window.PROJECTS || [];

  /* ---------- 渲染作品卡片 ---------- */
  var grid = document.getElementById("worksGrid");
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };

  function metaText(p) {
    var parts = [p.catName, p.location];
    if (p.area) parts.push(p.area);
    parts.push(p.year);
    return parts.join(" · ");
  }

  function statusClass(p) {
    if (p.status === "已交付") return "is-ok";
    if (p.status === "施工中" || p.status === "未开工") return "is-pending";
    return "is-stopped";
  }

  grid.innerHTML = projects.map(function (p, i) {
    return '' +
      '<article class="work-card reveal" data-category="' + p.cat + '" data-index="' + i + '">' +
        '<div class="work-media"><img src="' + p.cover + '" alt="' + p.title + '" loading="lazy" draggable="false">' +
        '<span class="img-shield" aria-hidden="true"></span></div>' +
        '<div class="work-info">' +
          '<h3>' + p.title + '</h3>' +
          '<p>' + metaText(p) + '</p>' +
        '</div>' +
      '</article>';
  }).join("");

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
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 导航滚动态（首屏深色背景 → 滚动后浅色） ---------- */
  var header = document.getElementById("siteHeader");
  function syncHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.7);
    header.classList.toggle("on-dark", window.scrollY <= window.innerHeight * 0.7);
  }
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- 移动端菜单 ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.querySelector(".site-nav");

  function closeMenu() {
    nav.classList.remove("is-open");
    header.classList.remove("menu-open");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", function () {
    var willOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", willOpen);
    header.classList.toggle("menu-open", willOpen);
    document.body.style.overflow = willOpen ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  // 窗口放大到桌面尺寸时自动收起菜单，避免残留锁定
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------- 作品筛选 ---------- */
  var filterBtns = document.querySelectorAll(".filter");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var f = btn.dataset.filter;
      grid.querySelectorAll(".work-card").forEach(function (card) {
        var show = f === "all" || card.dataset.category === f;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------- 项目详情浮层 ---------- */
  var overlay = document.getElementById("projectOverlay");
  var overlayTitle = document.getElementById("overlayTitle");
  var overlayMeta = document.getElementById("overlayMeta");
  var overlayStatus = document.getElementById("overlayStatus");
  var overlayNo = document.getElementById("overlayNo");
  var galleryEl = document.getElementById("overlayGallery");
  var current = 0;

  function showProject(i) {
    current = (i + projects.length) % projects.length;
    var p = projects[current];

    overlayNo.textContent = pad(current + 1) + " / " + pad(projects.length);
    overlayTitle.textContent = p.title;
    overlayMeta.textContent = metaText(p);
    overlayStatus.innerHTML = '<span class="tag">项目情况</span>' + p.status;
    overlayStatus.className = "overlay-status " + statusClass(p);

    // 瀑布流图片：保持原始宽高比（width/height 提示避免布局跳动）
    // 每张图覆盖一层透明遮罩：屏蔽右键另存 / 长按保存 / 拖拽，点击仍可打开灯箱
    galleryEl.innerHTML = p.gallery.map(function (img, gi) {
      return '<figure>' +
               '<img src="' + img.src + '" alt="' + p.title + ' · ' + pad(gi + 1) + '" ' +
                    'width="' + img.w + '" height="' + img.h + '" loading="lazy" draggable="false">' +
               '<span class="img-shield" aria-hidden="true"></span>' +
               '<figcaption>' + pad(gi + 1) + ' / ' + pad(p.gallery.length) + '</figcaption>' +
             '</figure>';
    }).join("");

    // 图片淡入
    galleryEl.querySelectorAll("img").forEach(function (img) {
      if (img.complete) { img.classList.add("is-loaded"); return; }
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
    });

    overlay.scrollTop = 0;
  }

  function openOverlay(i) {
    showProject(i);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeOverlay() {
    closeLightbox();
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".work-card");
    if (card) openOverlay(parseInt(card.dataset.index, 10));
  });

  document.getElementById("overlayClose").addEventListener("click", closeOverlay);
  document.getElementById("overlayPrev").addEventListener("click", function () { showProject(current - 1); });
  document.getElementById("overlayNext").addEventListener("click", function () { showProject(current + 1); });

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("is-open")) return;
    if (lb.classList.contains("is-open")) return;   // 灯箱打开时由灯箱自己处理按键
    if (e.key === "Escape") closeOverlay();
    if (e.key === "ArrowLeft") showProject(current - 1);
    if (e.key === "ArrowRight") showProject(current + 1);
  });

  /* ============================================================
     图片灯箱：点击详情图放大 / 缩放 / 拖拽 / 切换
     ============================================================ */
  var lb = document.getElementById("lightbox");
  var lbStage = document.getElementById("lbStage");
  var lbImg = document.getElementById("lbImg");
  var lbCounter = document.getElementById("lbCounter");
  var lbZoomVal = document.getElementById("lbZoomReset");

  var lbList = [];
  var lbIndex = 0;
  var scale = 1;
  var posX = 0;
  var posY = 0;
  var MAX_SCALE = 6;
  var dragging = false;
  var moved = false;
  var startX = 0, startY = 0, baseX = 0, baseY = 0;
  var pinch = null;

  lbImg.draggable = false;

  function render() {
    lbImg.style.transform = "translate(" + posX + "px," + posY + "px) scale(" + scale + ")";
    lbStage.classList.toggle("is-zoomed", scale > 1.001);
    lbZoomVal.textContent = Math.round(scale * 100) + "%";
  }

  function clampPan() {
    var rect = lbStage.getBoundingClientRect();
    var w = lbImg.offsetWidth * scale;
    var h = lbImg.offsetHeight * scale;
    var maxX = Math.max(0, (w - rect.width) / 2);
    var maxY = Math.max(0, (h - rect.height) / 2);
    posX = Math.min(maxX, Math.max(-maxX, posX));
    posY = Math.min(maxY, Math.max(-maxY, posY));
  }

  function setScale(next, clientX, clientY) {
    next = Math.min(MAX_SCALE, Math.max(1, next));
    var rect = lbStage.getBoundingClientRect();
    var cx = (typeof clientX === "number" ? clientX - rect.left - rect.width / 2 : 0);
    var cy = (typeof clientY === "number" ? clientY - rect.top - rect.height / 2 : 0);
    var ratio = next / scale;
    posX = cx - (cx - posX) * ratio;
    posY = cy - (cy - posY) * ratio;
    scale = next;
    if (scale <= 1.001) { scale = 1; posX = 0; posY = 0; }
    clampPan();
    render();
  }

  function resetView() {
    scale = 1; posX = 0; posY = 0;
    lbStage.classList.remove("is-dragging");
    render();
  }

  function loadLbImage() {
    var img = lbList[lbIndex];
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = "作品图片 " + pad(lbIndex + 1);
    lbCounter.textContent = pad(lbIndex + 1) + " / " + pad(lbList.length);
    resetView();
  }

  function openLightbox(list, i) {
    lbList = list;
    lbIndex = i;
    loadLbImage();
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    resetView();
  }

  function stepLb(dir) {
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    loadLbImage();
  }

  // 点击瀑布流图片 → 打开灯箱（遮罩层也会触发，因此以 figure 为判定单位）
  galleryEl.addEventListener("click", function (e) {
    var fig = e.target.closest("figure");
    if (!fig) return;
    var p = projects[current];
    var idx = Array.prototype.indexOf.call(galleryEl.querySelectorAll("figure"), fig);
    if (idx > -1) openLightbox(p.gallery, idx);
  });

  /* ---------- 图片防拿取（提高门槛，无法真正阻止下载） ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-show"); }, 2000);
  }

  document.addEventListener("contextmenu", function (e) {
    var hit = e.target.closest(".masonry img, .img-shield, .lb-stage img, .work-media img");
    if (hit) {
      e.preventDefault();
      showToast("图片版权归作者所有，请勿保存或转载");
    }
  });

  document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") e.preventDefault();
  });

  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); stepLb(-1); });
  document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); stepLb(1); });

  document.getElementById("lbZoomIn").addEventListener("click", function (e) {
    e.stopPropagation();
    setScale(scale * 1.4);
  });
  document.getElementById("lbZoomOut").addEventListener("click", function (e) {
    e.stopPropagation();
    setScale(scale / 1.4);
  });
  document.getElementById("lbZoomReset").addEventListener("click", function (e) {
    e.stopPropagation();
    resetView();
  });

  // 滚轮缩放（以鼠标位置为中心）
  lbStage.addEventListener("wheel", function (e) {
    if (!lb.classList.contains("is-open")) return;
    e.preventDefault();
    setScale(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY);
  }, { passive: false });

  // 双击放大 / 还原
  lbStage.addEventListener("dblclick", function (e) {
    e.preventDefault();
    if (scale > 1.01) { resetView(); } else { setScale(2.5, e.clientX, e.clientY); }
  });

  // 拖拽（放大后）
  lbStage.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch" && e.isPrimary === false) return;
    dragging = true;
    moved = false;
    startX = e.clientX; startY = e.clientY;
    baseX = posX; baseY = posY;
    if (scale > 1.001) lbStage.classList.add("is-dragging");
  });

  lbStage.addEventListener("pointermove", function (e) {
    if (!dragging || scale <= 1.001) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    posX = baseX + dx;
    posY = baseY + dy;
    clampPan();
    render();
    if (moved) e.preventDefault();
  });

  lbStage.addEventListener("pointerup", function (e) {
    if (!dragging) return;
    dragging = false;
    lbStage.classList.remove("is-dragging");
    // 未拖动且点在空白处（非图片）→ 关闭
    if (!moved && scale <= 1.001 && e.target === lbStage) {
      closeLightbox();
      return;
    }
    // 未拖动且点在图片上 → 双击逻辑交给 dblclick，此处不处理
  });

  lbStage.addEventListener("pointercancel", function () {
    dragging = false;
    lbStage.classList.remove("is-dragging");
  });

  // 移动端双指缩放
  function touchDist(t) {
    var dx = t[0].clientX - t[1].clientX;
    var dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  lbStage.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
      pinch = { d: touchDist(e.touches), s: scale };
    }
  }, { passive: true });

  lbStage.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2 && pinch) {
      e.preventDefault();
      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setScale(pinch.s * (touchDist(e.touches) / pinch.d), midX, midY);
    }
  }, { passive: false });

  lbStage.addEventListener("touchend", function (e) {
    if (e.touches.length < 2) pinch = null;
  }, { passive: true });

  // 灯箱内键盘：Esc 关闭，←/→ 切图，+/- 缩放
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") { closeLightbox(); e.preventDefault(); }
    if (e.key === "ArrowLeft") { stepLb(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { stepLb(1); e.preventDefault(); }
    if (e.key === "+" || e.key === "=") { setScale(scale * 1.3); e.preventDefault(); }
    if (e.key === "-") { setScale(scale / 1.3); e.preventDefault(); }
  });

})();
