document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("product-popup");

  document.querySelectorAll(".view-product-btn").forEach(button => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card");
      const product = JSON.parse(productCard.getAttribute("data-product"));

      const sizes  = [...new Set(product.variants.map(v => v.option1).filter(Boolean))];
      const colors = [...new Set(product.variants.map(v => v.option2).filter(Boolean))];

      const colorMap = {
        "White": "#fff",
        "Black": "#111",
        "Blue": "#1656a9",
        "Red": "#c00",
        "Grey": "#888",
      };

      const colorOptions = colors.map(c =>
        `<button type="button" class="color-pill" data-color="${c}">
          <span class="color-bar" style="background:${colorMap[c] || '#bbb'};"></span>
          ${c}
        </button>`
      ).join("");

      const colorHtml = `
        <div class="color-wrapper">
          <label class="popup-label color-label">Color</label>
          <div class="color-pills">
            ${colorOptions}
          </div>
        </div>
      `;

      const sizeOptions  = sizes.map(s => `<div class="custom-size-dropdown__option">${s}</div>`).join("");
      const sizeDropdownHtml = `
        <div class="size-wrapper">
          <label class="popup-label size-label">Size</label>
          <div class="custom-size-dropdown">
            <div class="custom-size-dropdown__selected">
              <span>Choose your size</span>
              <span class="custom-size-dropdown__arrowbox">
                <span class="custom-size-dropdown__arrow">
                  <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
                    <polyline points="8,12 14,18 20,12" fill="none" stroke="#222" stroke-width="2.5"/>
                  </svg>
                </span>
              </span>
            </div>
            <div class="custom-size-dropdown__options">
              ${sizeOptions}
            </div>
          </div>
        </div>
      `;

      const content = `
        <div class="popup-inner">
          <button class="popup-close" aria-label="Close">&times;</button>
          <div class="popup-content">
            <div class="popup-left">
              <img class="popup-image" src="${product.featured_image.src}" alt="${product.title}">
            </div>
            <div class="popup-right">
              <h2>${product.title}</h2>
              <div class="price">${(product.price / 100).toFixed(2)} ${product.currency}</div>
              <div class="description">${product.description}</div>
              ${colorHtml}
              ${sizeDropdownHtml}
              <button class="add-to-cart">
                ADD TO CART <span class="arrow">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      `;

      popup.innerHTML = content;
      popup.style.display = "flex";

      popup.querySelector(".popup-close").addEventListener("click", () => {
        popup.style.display = "none";
      });

      const colorPills = popup.querySelectorAll(".color-pill");
      let selectedColor = "";
      colorPills.forEach(btn => {
        btn.addEventListener("click", function () {
          colorPills.forEach(b => b.classList.remove("active"));
          this.classList.add("active");
          selectedColor = this.getAttribute("data-color");
          updateVariant();
        });
      });

      const dropdown = popup.querySelector('.custom-size-dropdown');
      const selectedSpan = dropdown.querySelector('.custom-size-dropdown__selected span');
      const options = dropdown.querySelectorAll('.custom-size-dropdown__option');
      let selectedSize = "";

      dropdown.addEventListener('click', function(e) {
        dropdown.classList.toggle('open');
      });
      options.forEach(option => {
        option.addEventListener('click', function(e){
          e.stopPropagation();
          selectedSpan.textContent = this.textContent;
          options.forEach(opt => opt.classList.remove('active'));
          this.classList.add('active');
          selectedSize = this.textContent;
          dropdown.classList.remove('open');
          updateVariant();
        });
      });
      document.addEventListener('click', function(e){
        if(!dropdown.contains(e.target)){
          dropdown.classList.remove('open');
        }
      });
      dropdown.addEventListener('keydown', function(e){
        if(e.key === "Escape"){ dropdown.classList.remove('open'); }
        if(e.key === " " || e.key === "Enter"){ dropdown.classList.toggle('open'); e.preventDefault(); }
      });

      const addToCartBtn = popup.querySelector(".add-to-cart");
      let selectedVariantId = null;

      function updateVariant() {
        const matched = product.variants.find(v =>
          v.option1 === selectedSize &&
          v.option2 === selectedColor
        );
        if (matched) {
          selectedVariantId = matched.id;
          addToCartBtn.disabled = false;
        } else {
          selectedVariantId = null;
          addToCartBtn.disabled = true;
        }
      }

      addToCartBtn.addEventListener("click", () => {
        if (!selectedVariantId) return;
        fetch(`/cart/add.js`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedVariantId, quantity: 1 })
        })
        .then(response => response.json())
        .then(data => {
          popup.style.display = "none";
        })
        .catch(err => {
          alert("Failed to add product.");
          console.error(err);
        });
      });
    });
  });
});
