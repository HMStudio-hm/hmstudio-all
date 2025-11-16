// lmilfad iga win smungh kulu lmizat ghyat lblast v2.7.7 (nzoyd Zid updates 29-10 | no direct API calling for products) - hadi hiya update dyal version 2.5.2 li khdama f aln7l ila bghit ndir backend w ikhdm dakshi.[trying to fix analytics.]
// Created by HMStudio

(function() {

  // Common utility to get URL parameters
  function getScriptParams() {
    const scriptTag = document.currentScript;
    const scriptUrl = new URL(scriptTag.src);
    return {
      storeId: scriptUrl.searchParams.get('storeId'),
      quickView: scriptUrl.searchParams.get('quickView') === 'true',
      announcement: scriptUrl.searchParams.get('announcement') === 'true',
      smartCart: scriptUrl.searchParams.get('smartCart') === 'true',
      slidingCart: scriptUrl.searchParams.get('slidingCart') === 'true',
      upsell: scriptUrl.searchParams.get('upsell') === 'true',
      campaigns: scriptUrl.searchParams.get('campaigns'),
      upsellCampaigns: scriptUrl.searchParams.get('upsellCampaigns')
    };
  }

  // Get common parameters
  const params = getScriptParams();
  const storeId = params.storeId;

  if (!storeId) {
    return;
  }

  console.log('HMStudio initialized');

  function getCurrentLanguage() {
    return document.documentElement.lang || 'ar';
  }

  // =============== QUICK VIEW FEATURE ===============
  if (params.quickView) {
    console.log('Initializing Quick View feature');
    
  function getCurrentLanguage() {
    return document.documentElement.lang || 'ar';
  }
  const config = {
    ...window.HMStudioQuickViewConfig,
    storeId: storeId
  };
  
  const QuickViewStats = {
    async trackEvent(eventType, data) {
      try {
        const timestamp = new Date();
        const month = timestamp.toISOString().slice(0, 7);
  
        const eventData = {
          storeId,
          eventType,
          timestamp: timestamp.toISOString(),
          month,
          vitrin: window.vitrin === true,
          ...data
        };
  
        const response = await fetch(`https://europe-west3-hmstudio-85f42.cloudfunctions.net/trackQuickViewStats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });
  
        const responseData = await response.json();
  
        if (!response.ok) {
          throw new Error(`Quick View stats tracking failed: ${responseData.error || response.statusText}`);
        }
  
      } catch (error) {
      }
    }
  };
  
  async function fetchProductData(productId) {
    const url = `https://europe-west3-hmstudio-85f42.cloudfunctions.net/getProductData?storeId=${storeId}&productId=${productId}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch product data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  function createImageGallery(images) {
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'quick-view-gallery';
    galleryContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    `;
  
    const mainImageContainer = document.createElement('div');
    mainImageContainer.style.cssText = `
      width: 100%;
      height: 300px;
      overflow: hidden;
      border-radius: 8px;
      position: relative;
    `;
  
    const mainImage = document.createElement('img');
    if (images && images.length > 0) {
      mainImage.src = images[0].url;
      mainImage.alt = images[0].alt_text || 'Product Image';
    } else {
      mainImage.src = 'https://via.placeholder.com/400x400?text=No+Image+Available';
      mainImage.alt = 'No Image Available';
    }
    mainImage.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
    `;
    mainImageContainer.appendChild(mainImage);
  
    if (images && images.length > 1) {
      const thumbnailsContainer = document.createElement('div');
      thumbnailsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding: 5px 0;
      `;
  
      images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image.thumbnail;
        thumbnail.alt = image.alt_text || `Product Image ${index + 1}`;
        thumbnail.style.cssText = `
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid ${index === 0 ? '#4CAF50' : 'transparent'};
        `;
  
        thumbnail.addEventListener('click', () => {
          mainImage.src = image.url;
          thumbnailsContainer.querySelectorAll('img').forEach(thumb => {
            thumb.style.border = '2px solid transparent';
          });
          thumbnail.style.border = '2px solid #4CAF50';
        });
  
        thumbnailsContainer.appendChild(thumbnail);
      });
  
      galleryContainer.appendChild(thumbnailsContainer);
    }
  
    galleryContainer.insertBefore(mainImageContainer, galleryContainer.firstChild);
    return galleryContainer;
  }
  
  function createVariantsSection(productData) {
    const currentLang = getCurrentLanguage();
    const variantsContainer = document.createElement('div');
    variantsContainer.className = 'quick-view-variants';
    variantsContainer.style.cssText = `
      margin-top: 15px;
      padding: 10px 0;
    `;
  
    if (productData.variants && productData.variants.length > 0) {
      const variantAttributes = new Map();
      
      productData.variants.forEach(variant => {
        if (variant.attributes && variant.attributes.length > 0) {
          variant.attributes.forEach(attr => {
            if (!variantAttributes.has(attr.name)) {
              variantAttributes.set(attr.name, {
                name: attr.name,
                slug: attr.slug,
                values: new Set()
              });
            }
            variantAttributes.get(attr.name).values.add(attr.value[currentLang]);
          });
        }
      });
  
      variantAttributes.forEach(attr => {
        const select = document.createElement('select');
        select.className = 'variant-select';
        select.style.cssText = `
          margin: 5px 0;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        `;
  
        const labelText = currentLang === 'ar' ? attr.slug : attr.name;
        
        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.cssText = `
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        `;
  
        const placeholderText = currentLang === 'ar' ? `اختر ${labelText}` : `Select ${labelText}`;
        
        let optionsHTML = `<option value="">${placeholderText}</option>`;
        
        Array.from(attr.values).forEach(value => {
          optionsHTML += `<option value="${value}">${value}</option>`;
        });
        
        select.innerHTML = optionsHTML;
  
        select.addEventListener('change', () => {
          updateSelectedVariant(productData);
        });
  
        variantsContainer.appendChild(label);
        variantsContainer.appendChild(select);
      });
    }
  
    return variantsContainer;
  }
  
  function createQuantitySelector(currentLang) {
    const quantityContainer = document.createElement('div');
    quantityContainer.style.cssText = `
      margin: 15px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
  
    const quantityLabel = document.createElement('label');
    quantityLabel.textContent = currentLang === 'ar' ? 'الكمية:' : 'Quantity:';
    quantityLabel.style.cssText = `
      font-weight: bold;
      color: #333;
    `;
  
    const quantityWrapper = document.createElement('div');
    quantityWrapper.style.cssText = `
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    `;
  
    const decreaseBtn = document.createElement('button');
    decreaseBtn.type = 'button';
    decreaseBtn.textContent = '-';
    decreaseBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      transition: background-color 0.3s ease;
    `;
  
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.name = 'quantity';
    quantityInput.id = 'product-quantity';
    quantityInput.min = '1';
    quantityInput.value = '1';
    quantityInput.style.cssText = `
      width: 50px;
      height: 32px;
      border: none;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
      text-align: center;
      font-size: 14px;
      -moz-appearance: textfield;
    `;
    quantityInput.addEventListener('mousewheel', (e) => e.preventDefault());
  
    const increaseBtn = document.createElement('button');
    increaseBtn.type = 'button';
    increaseBtn.textContent = '+';
    increaseBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      transition: background-color 0.3s ease;
    `;
  
    decreaseBtn.addEventListener('mouseover', () => {
      decreaseBtn.style.backgroundColor = '#e0e0e0';
    });
    decreaseBtn.addEventListener('mouseout', () => {
      decreaseBtn.style.backgroundColor = '#f5f5f5';
    });
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  
    increaseBtn.addEventListener('mouseover', () => {
      increaseBtn.style.backgroundColor = '#e0e0e0';
    });
    increaseBtn.addEventListener('mouseout', () => {
      increaseBtn.style.backgroundColor = '#f5f5f5';
    });
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
  
    quantityInput.addEventListener('input', () => {
      let value = parseInt(quantityInput.value);
      if (isNaN(value) || value < 1) {
        quantityInput.value = 1;
      }
    });
  
    quantityInput.addEventListener('blur', () => {
      if (quantityInput.value === '') {
        quantityInput.value = 1;
      }
    });
  
    quantityWrapper.appendChild(decreaseBtn);
    quantityWrapper.appendChild(quantityInput);
    quantityWrapper.appendChild(increaseBtn);
    
    quantityContainer.appendChild(quantityLabel);
    quantityContainer.appendChild(quantityWrapper);
  
    return quantityContainer;
  }
  
  function updateSelectedVariant(productData) {
    const form = document.getElementById('product-form');
    if (!form) {
      return;
    }
  
    const currentLang = getCurrentLanguage();
    const selectedValues = {};
  
    form.querySelectorAll('.variant-select').forEach(select => {
      if (select.value) {
        const labelText = select.previousElementSibling.textContent;
        selectedValues[labelText] = select.value;
      }
    });
  
    const selectedVariant = productData.variants.find(variant => {
      return variant.attributes.every(attr => {
        const attrLabel = currentLang === 'ar' ? attr.slug : attr.name;
        return selectedValues[attrLabel] === attr.value[currentLang];
      });
    });
  
    if (selectedVariant) {
      let productIdInput = form.querySelector('input[name="product_id"]');
      if (!productIdInput) {
        productIdInput = document.createElement('input');
        productIdInput.type = 'hidden';
        productIdInput.name = 'product_id';
        form.appendChild(productIdInput);
      }
      productIdInput.value = selectedVariant.id;
  
      const priceElement = form.querySelector('#product-price');
      const oldPriceElement = form.querySelector('#product-old-price');
      
      if (priceElement) {
        if (selectedVariant.formatted_sale_price) {
          priceElement.textContent = selectedVariant.formatted_sale_price;
          if (oldPriceElement) {
            oldPriceElement.textContent = selectedVariant.formatted_price;
            oldPriceElement.style.display = 'block';
          }
        } else {
          priceElement.textContent = selectedVariant.formatted_price;
          if (oldPriceElement) {
            oldPriceElement.style.display = 'none';
          }
        }
      }
  
      const addToCartBtn = form.querySelector('.add-to-cart-btn');
      if (addToCartBtn) {
        if (!selectedVariant.unavailable) {
          addToCartBtn.disabled = false;
          addToCartBtn.classList.remove('disabled');
          addToCartBtn.style.opacity = '1';
        } else {
          addToCartBtn.disabled = true;
          addToCartBtn.classList.add('disabled');
          addToCartBtn.style.opacity = '0.5';
        }
      }
    }
  }
  
  async function handleAddToCart(productData) {
    const currentLang = getCurrentLanguage();
    const form = document.getElementById('product-form');
    
    const quantityInput = form.querySelector('#product-quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (isNaN(quantity) || quantity < 1) {
      const message = currentLang === 'ar' 
        ? 'الرجاء إدخال كمية صحيحة'
        : 'Please enter a valid quantity';
      alert(message);
      return;
    }
  
    if (productData.variants && productData.variants.length > 0) {
      const selectedVariants = {};
      const missingSelections = [];
      
      form.querySelectorAll('.variant-select').forEach(select => {
        const labelText = select.previousElementSibling.textContent;
        if (!select.value) {
          missingSelections.push(labelText);
        }
        selectedVariants[labelText] = select.value;
      });
  
      if (missingSelections.length > 0) {
        const message = currentLang === 'ar' 
          ? `الرجاء اختيار ${missingSelections.join(', ')}`
          : `Please select ${missingSelections.join(', ')}`;
        alert(message);
        return;
      }
  
      const selectedVariant = productData.variants.find(variant => {
        return variant.attributes.every(attr => {
          const attrLabel = currentLang === 'ar' ? attr.slug : attr.name;
          return selectedVariants[attrLabel] === attr.value[currentLang];
        });
      });
  
      if (!selectedVariant) {
        const message = currentLang === 'ar' 
          ? 'هذا المنتج غير متوفر بالمواصفات المختارة'
          : 'This product variant is not available';
        alert(message);
        return;
      }
  
      const productIdInput = form.querySelector('input[name="product_id"]');
      if (productIdInput) {
        productIdInput.value = selectedVariant.id;
      }
    }
  
    let productIdInput = form.querySelector('input[name="product_id"]');
    if (!productIdInput) {
      productIdInput = document.createElement('input');
      productIdInput.type = 'hidden';
      productIdInput.name = 'product_id';
      form.appendChild(productIdInput);
    }
    productIdInput.value = productData.id;
  
    let formQuantityInput = form.querySelector('input[name="quantity"]');
    if (!formQuantityInput) {
      formQuantityInput = document.createElement('input');
      formQuantityInput.type = 'hidden';
      formQuantityInput.name = 'quantity';
      form.appendChild(formQuantityInput);
    }
    formQuantityInput.value = quantity;
  
    const loadingSpinners = document.querySelectorAll('.add-to-cart-progress');
    loadingSpinners.forEach(spinner => spinner.classList.remove('d-none'));
  
    const formData = new FormData(form);
  
    try {
      let cartPromise;
      if (window.vitrin === true) {
        cartPromise = zid.cart.addProduct({ 
          product_id: formData.get('product_id'),
          quantity: formData.get('quantity')
        })
      } else {
        cartPromise = zid.store.cart.addProduct({ 
          formId: 'product-form',
          data: {
            product_id: formData.get('product_id'),
            quantity: formData.get('quantity')
          }
        })
      }
      cartPromise.then(async function (response) {
        if (response.status === 'success') {
          if (typeof setCartBadge === 'function') {
            setCartBadge(response.data.cart.products_count);
          }
          const modal = document.querySelector('.quick-view-modal');
          if (modal) {
            modal.remove();
          }
          
          // Track event after success (don't block on this)
          try {
            await QuickViewStats.trackEvent('cart_add', {
              productId: formData.get('product_id'),
              quantity: parseInt(formData.get('quantity')),
              productName: typeof productData.name === 'object' ? 
                productData.name[currentLang] : 
                productData.name
            });
          } catch (trackingError) {
          }
        } else {
          const errorMessage = currentLang === 'ar' 
            ? response.data.message || 'فشل إضافة المنتج إلى السلة'
            : response.data.message || 'Failed to add product to cart';
          alert(errorMessage);
        }
      })
      .catch(function(error) {
      })
      .finally(function() {
        loadingSpinners.forEach(spinner => spinner.classList.add('d-none'));
      });
    } catch (error) {
      loadingSpinners.forEach(spinner => spinner.classList.add('d-none'));
    }
  }
  
  async function displayQuickViewModal(productData) {
    const currentLang = getCurrentLanguage();
  
    try {
      await QuickViewStats.trackEvent('modal_open', {
        productId: productData.id,
        productName: typeof productData.name === 'object' ? 
          productData.name[currentLang] : 
          productData.name
      });
    } catch (trackingError) {
    }
    
    const existingModal = document.querySelector('.quick-view-modal');
    if (existingModal) {
      existingModal.remove();
    }
  
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
      document.head.appendChild(viewport);
    }
  
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 16px;
    `;
  
    const content = document.createElement('div');
    content.className = 'quick-view-content';
    content.style.cssText = `
      background-color: white;
      border-radius: 12px;
      width: 95%;
      max-height: 90vh;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      max-width: 1000px;
      overflow: hidden;
    `;
  
    const form = document.createElement('form');
    form.id = 'product-form';
    form.style.cssText = `
      display: flex;
      width: 100%;
      height: 100%;
      flex-direction: column;
      overflow-y: auto;
    `;
  
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @media screen and (min-width: 768px) {
        .quick-view-form {
          flex-direction: row !important;
          overflow: hidden !important;
        }
        .quick-view-gallery {
          width: 50% !important;
          border-bottom: none !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          padding-top: 40px !important;
        }
        .quick-view-details {
          width: 50% !important;
          padding-top: 40px !important;
        }
        .quick-view-gallery img {
          margin: 0 auto !important;
        }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  
    form.className = 'quick-view-form';
    content.appendChild(form);
  
    const gallerySection = document.createElement('div');
    gallerySection.className = 'quick-view-gallery';
    gallerySection.style.cssText = `
      width: 100%;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
  
    if (productData.images && productData.images.length > 0) {
      const gallery = createImageGallery(productData.images);
      gallery.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
        width: 100%;
      `;
      gallerySection.appendChild(gallery);
    }
  
    const detailsSection = document.createElement('div');
    detailsSection.className = 'quick-view-details';
    detailsSection.style.cssText = `
      width: 100%;
      padding: 20px;
      display: flex;
      flex-direction: column;
      text-align: ${currentLang === 'ar' ? 'right' : 'left'};
      direction: ${currentLang === 'ar' ? 'rtl' : 'ltr'};
    `;
  
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: ${currentLang === 'ar' ? 'auto' : '12px'};
      left: ${currentLang === 'ar' ? '12px' : 'auto'};
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      transition: all 0.2s;
      z-index: 10;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      &:hover {
        background-color: #f3f4f6;
        color: #000;
      }
    `;
    closeBtn.addEventListener('click', () => modal.remove());
    content.appendChild(closeBtn);
  
    const title = document.createElement('h2');
    title.className = 'quick-view-title';
    title.textContent = productData.name[currentLang] || productData.name;
    title.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      line-height: 1.3;
    `;
    detailsSection.appendChild(title);
  
    if (productData.rating) {
      const ratingContainer = document.createElement('div');
      ratingContainer.className = 'quick-view-rating';
      ratingContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 14px;
      `;
  
      const starRating = document.createElement('div');
      starRating.style.cssText = `
        display: flex;
        align-items: center;
      `;
  
      const fullStars = Math.floor(productData.rating.average);
      const remainingStars = 5 - fullStars;
  
      for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.style.color = '#fbbf24';
        starRating.appendChild(star);
      }
  
      for (let i = 0; i < remainingStars; i++) {
        const star = document.createElement('span');
        star.textContent = '☆';
        star.style.color = '#e5e7eb';
        starRating.appendChild(star);
      }
  
      const ratingText = document.createElement('span');
      ratingText.textContent = `(${productData.rating.average.toFixed(1)})`;
      ratingText.style.color = '#6b7280';
  
      ratingContainer.appendChild(starRating);
      ratingContainer.appendChild(ratingText);
      detailsSection.appendChild(ratingContainer);
    }
  
    const priceContainer = document.createElement('div');
    priceContainer.className = 'quick-view-price-container';
    priceContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    `;
  
    const currencySymbol = currentLang === 'ar' ? 'ر.س' : 'SAR';
  
    if (productData.sale_price) {
      const salePrice = document.createElement('span');
      salePrice.className = 'quick-view-sale-price';
      salePrice.style.cssText = `
        font-size: 24px;
        font-weight: 700;
        color: #059669;
      `;
      salePrice.textContent = `${productData.sale_price} ${currencySymbol}`;
  
      const originalPrice = document.createElement('span');
      originalPrice.className = 'quick-view-original-price';
      originalPrice.style.cssText = `
        text-decoration: line-through;
        color: #6b7280;
        font-size: 16px;
      `;
      originalPrice.textContent = `${productData.price} ${currencySymbol}`;
  
      priceContainer.appendChild(salePrice);
      priceContainer.appendChild(originalPrice);
    } else {
      const price = document.createElement('span');
      price.className = 'quick-view-current-price';
      price.style.cssText = `
        font-size: 24px;
        font-weight: 700;
        color: #059669;
      `;
      price.textContent = `${productData.price} ${currencySymbol}`;
      priceContainer.appendChild(price);
    }
  
    detailsSection.appendChild(priceContainer);
  
    if (productData.short_description && productData.short_description[currentLang]) {
      const description = document.createElement('p');
      description.className = 'quick-view-description';
      description.style.cssText = `
        margin-bottom: 20px;
        line-height: 1.5;
        color: #4b5563;
        font-size: 14px;
      `;
      description.textContent = productData.short_description[currentLang];
      detailsSection.appendChild(description);
    }
  
    if (productData.variants && productData.variants.length > 0) {
      const variantsSection = createVariantsSection(productData);
      variantsSection.style.cssText += `
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
      `;
      detailsSection.appendChild(variantsSection);
    }
  
    const quantitySelector = createQuantitySelector(currentLang);
    quantitySelector.className = 'quick-view-quantity-selector';
    quantitySelector.style.cssText = `
      display: flex;
      justify-content: center;
      width: 100%;
    `;
  
    const quantityLabel = quantitySelector.querySelector('label');
    if (quantityLabel) {
      quantityLabel.remove();
    }
  
    const quantityWrapper = quantitySelector.querySelector('div');
    if (quantityWrapper) {
      quantityWrapper.style.cssText = `
        display: flex;
        width: 100%;
        height: 48px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
      `;
  
      const decreaseBtn = quantityWrapper.querySelector('button:first-child');
      const increaseBtn = quantityWrapper.querySelector('button:last-child');
      const quantityInput = quantityWrapper.querySelector('input');
  
      if (decreaseBtn && increaseBtn && quantityInput) {
        const buttonStyle = `
          width: 48px;
          height: 100%;
          background-color: #f3f4f6;
          border: none;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        decreaseBtn.style.cssText = buttonStyle;
        increaseBtn.style.cssText = buttonStyle;
  
        quantityInput.style.cssText = `
          flex: 1;
          height: 100%;
          border: none;
          text-align: center;
          font-size: 16px;
          -moz-appearance: textfield;
        `;
      }
    }
  
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'quick-view-purchase-controls';
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: auto;
      padding-top: 20px;
    `;
  
    const addToCartBtn = document.createElement('button');
    addToCartBtn.textContent = currentLang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart';
    addToCartBtn.className = 'btn btn-primary add-to-cart-btn quick-view-add-to-cart-btn';
    addToCartBtn.type = 'button';
    addToCartBtn.style.cssText = `
      width: 100%;
      padding: 12px 20px;
      background-color: #059669;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 48px;
      &:hover {
        background-color: #047857;
      }
    `;
  
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'add-to-cart-progress d-none';
    loadingSpinner.style.cssText = `
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    `;
    addToCartBtn.appendChild(loadingSpinner);
  
    addToCartBtn.addEventListener('click', () => {
      handleAddToCart(productData);
    });
  
    buttonsContainer.appendChild(quantitySelector);
    buttonsContainer.appendChild(addToCartBtn);
    detailsSection.appendChild(buttonsContainer);
  
    const productIdInput = document.createElement('input');
    productIdInput.type = 'hidden';
    productIdInput.id = 'product-id';
    productIdInput.name = 'product_id';
    productIdInput.value = productData.id;
    form.appendChild(productIdInput);
  
    form.appendChild(gallerySection);
    form.appendChild(detailsSection);
    modal.appendChild(content);
  
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  
    document.body.appendChild(modal);
    
    if (productData.selected_product) {
      updateSelectedVariant(productData);
    }
  }
  
  async function openQuickView(productId) {
    try {
      const productData = await fetchProductData(productId);
      displayQuickViewModal(productData);
    } catch (error) {
    }
  }
  
  // Support both Soft theme and Perfect theme selectors
  function addQuickViewButtons() {
    
    // Support Soft theme, Perfect theme, and Assayl theme selectors
    const productCardSelectors = [
        '.product-item.position-relative', // Soft theme
        '.card.card-product',              // Perfect theme
        '.product.product-1',  // Assayl theme - main product pages
        'product product-1 ',
        'col-md-3 col-6 ',
        '.col-md-3 col-6 ', // Assayl theme - grid container
        '.product.position-relative',  // Assayl theme - carousel/slider products
        'product position-relative',
        'item text-center slick-slide slick-active',
        '.item text-center slick-slide slick-active' // Assayl theme - slider items
    ];

    let productCards = [];
    let currentTheme = 'unknown';
    
    // Try each selector to identify the theme
for (const selector of productCardSelectors) {
  const cards = document.querySelectorAll(selector);
  if (cards.length > 0) {
      productCards = cards;
      if (selector === '.product-item.position-relative') {
          currentTheme = 'soft';
      } else if (selector === '.card.card-product') {
          currentTheme = 'perfect';
      } else if (selector.includes('.product.product-1') || selector.includes('.product.position-relative')) {
          currentTheme = 'assayl';
      }
      break;
  }
}  
    productCards.forEach(card => {
        if (card.querySelector('.quick-view-btn')) {
            return;
        }

        // Support different product ID data attributes for different themes
        let productId = null;
        
        if (currentTheme === 'assayl') {
            // For Assayl theme, look for data-wishlist-id on the wishlist span
            const wishlistSpan = card.querySelector('.add-to-wishlist[data-wishlist-id]');
            if (wishlistSpan) {
                productId = wishlistSpan.getAttribute('data-wishlist-id');
            }
        } else {
            // For Soft and Perfect themes (existing logic)
            const wishlistBtn = card.querySelector('[data-wishlist-id]');
            const productForm = card.querySelector('form[data-product-id]');
            
            if (wishlistBtn) {
                productId = wishlistBtn.getAttribute('data-wishlist-id');
            } else if (productForm) {
                productId = productForm.getAttribute('data-product-id');
            }
        }
        
        if (productId) {
            // Find the button container based on theme
            let buttonContainer = null;
            
            if (currentTheme === 'assayl') {
              // For Assayl theme, find the add to cart button container
              // First, try to find the .mt-2 div that contains the cart button (home page)
              const mtDiv = card.querySelector('.bottom-box .mt-2');
              if (mtDiv) {
                  buttonContainer = mtDiv;
              } else {
                  // For all products page - look for the product-bottom container
                  const productBottom = card.querySelector('.product-bottom');
                  if (productBottom) {
                      buttonContainer = productBottom;
                  } else {
                      // Fallback: find the cart button's parent
                      const addToCartBtn = card.querySelector('.btn-cart');
                      if (addToCartBtn && addToCartBtn.parentElement) {
                          buttonContainer = addToCartBtn.parentElement;
                      } else {
                          // Last fallback: look for the bottom box container
                          buttonContainer = card.querySelector('.bottom-box');
                      }
                  }
              }
          } else {
                // For Soft and Perfect themes (existing logic)
                buttonContainer = card.querySelector('.card-footer') || 
                                card.querySelector('div[style*="text-align: center"]');

                // If no container found, create one for Perfect theme
                if (!buttonContainer) {
                    buttonContainer = document.createElement('div');
                    buttonContainer.className = 'card-footer bg-transparent border-0';
                    card.appendChild(buttonContainer);
                }
            }

            if (!buttonContainer) {
                return;
            }

            // Update container styles based on theme
            if (currentTheme === 'assayl') {
                // For Assayl theme, add the button inline with existing add to cart
                if (!buttonContainer.style.display || buttonContainer.style.display !== 'flex') {
                    buttonContainer.style.cssText += `
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex-wrap: wrap;
                    `;
                }
            } else {
                // For other themes (existing logic)
                buttonContainer.style.cssText += `
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    width: 100%;
                `;
            }

            const button = document.createElement('button');
            button.className = 'quick-view-btn';
            
            // Style the button based on theme
            if (currentTheme === 'assayl') {
                // For Assayl theme, use btn-primary classes for consistent styling
                button.className = 'quick-view-btn btn btn-outline-primary';
                button.style.cssText = `
                    width: 100%;
                    height: auto;
                    padding: 8px 16px;
                    margin-top: 8px;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    gap: 8px;
                `;
                
                // Add responsive styles for mobile
                const style = document.createElement('style');
                if (!document.querySelector('#quick-view-responsive-style')) {
                    style.id = 'quick-view-responsive-style';
                    style.textContent = `
                        @media (max-width: 768px) {
                            .quick-view-btn {
                                padding: 6px 12px !important;
                                font-size: 12px !important;
                                height: 36px !important;
                            }
                            .quick-view-btn span {
                                display: none !important;
                            }
                            .quick-view-btn svg {
                                width: 16px !important;
                                height: 16px !important;
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            // Add spinner animation style for all themes
const spinnerStyle = document.createElement('style');
if (!document.querySelector('#quick-view-spinner-style')) {
    spinnerStyle.id = 'quick-view-spinner-style';
    spinnerStyle.textContent = `
        .quick-view-spinner {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinnerStyle);
}
            else {
                // Existing style for other themes
                button.style.cssText = `
                    width: 35px;
                    height: 35px;
                    padding: 0;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background-color: #ffffff;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    vertical-align: middle;
                    margin: 5px;
                `;
            }

            // Add eye icon using SVG
            if (currentTheme === 'assayl') {
                // For Assayl theme, add text with icon
                button.innerHTML = `
                    <svg class="quick-view-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg class="quick-view-spinner" style="display: none;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    <span>عرض سريع</span>
                `;
                
                // Add spinner animation style
                const style = document.createElement('style');
                if (!document.querySelector('#quick-view-spinner-style')) {
                    style.id = 'quick-view-spinner-style';
                    style.textContent = `
                        .quick-view-spinner {
                            animation: spin 1s linear infinite;
                        }
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }
              } else {
                // For other themes, add icon with loading spinner
                button.innerHTML = `
                    <svg class="quick-view-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg class="quick-view-spinner" style="display: none;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                `;
            }

            // Add hover effects
            if (currentTheme === 'assayl') {
                // Let Bootstrap handle btn-outline-primary hover effects
                // No manual hover styling needed
            } else {
                button.addEventListener('mouseover', () => {
                    button.style.backgroundColor = '#f0f0f0';
                });

                button.addEventListener('mouseout', () => {
                    button.style.backgroundColor = '#ffffff';
                });
            }

            button.addEventListener('click', (e) => {
              e.preventDefault();
              
              // Show loading state for all themes
              const icon = button.querySelector('.quick-view-icon');
              const spinner = button.querySelector('.quick-view-spinner');
              
              if (icon && spinner) {
                  icon.style.display = 'none';
                  spinner.style.display = 'inline-block';
                  button.style.pointerEvents = 'none';
                  button.style.opacity = '0.7';
                  
                  // For Assayl theme, also update text
                  if (currentTheme === 'assayl') {
                      const text = button.querySelector('span');
                      if (text) text.textContent = 'جاري التحميل...';
                  }
              }
              
              openQuickView(productId).finally(() => {
                  // Reset loading state for all themes
                  if (icon && spinner) {
                      setTimeout(() => {
                          icon.style.display = 'inline-block';
                          spinner.style.display = 'none';
                          button.style.pointerEvents = 'auto';
                          button.style.opacity = '1';
                          
                          // For Assayl theme, also reset text
                          if (currentTheme === 'assayl') {
                              const text = button.querySelector('span');
                              if (text) text.textContent = 'عرض سريع';
                          }
                      }, 300);
                  }
              });
          });

            // Insert button based on theme
try {
  if (currentTheme === 'assayl') {
      // Check if this is the all products page layout
      if (buttonContainer.classList.contains('product-bottom')) {
          // For all products page - add after the cart button
          const cartButton = buttonContainer.querySelector('.btn-cart');
          if (cartButton) {
              cartButton.parentNode.insertBefore(button, cartButton.nextSibling);
          } else {
              buttonContainer.appendChild(button);
          }
      } else {
          // For home page - add inside the .mt-2 container
          buttonContainer.appendChild(button);
      }
  } else {
      // For Perfect theme
      if (buttonContainer.classList.contains('card-footer')) {
          buttonContainer.appendChild(button);
      } else {
          // For Soft theme
          buttonContainer.insertBefore(button, buttonContainer.firstChild);
      }
  }
} catch (error) {
  buttonContainer.appendChild(button);
}
        }
    });
}
  
  addQuickViewButtons();
  
  const observer = new MutationObserver(() => {
    addQuickViewButtons();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  window.HMStudioQuickView = {
    openQuickView: openQuickView
  };

}

  // =============== ANNOUNCEMENT BAR FEATURE ===============
  if (params.announcement) {
    console.log('Initializing Announcement feature');
  
  function getCurrentLanguage() {
    return document.documentElement.lang || 'ar';
  }
  
  async function fetchAnnouncementSettings() {
    try {
      const response = await fetch(`https://europe-west3-hmstudio-85f42.cloudfunctions.net/getAnnouncementSettings?storeId=${storeId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  }
  
  function createAnnouncementBar(settings) {
    const existingBar = document.getElementById('hmstudio-announcement-bar');
    if (existingBar) {
      existingBar.remove();
    }
  
    const bar = document.createElement('div');
    bar.id = 'hmstudio-announcement-bar';
    bar.style.cssText = `
      width: 100%;
      background-color: ${settings.announcementBackgroundColor};
      color: ${settings.announcementTextColor};
      overflow: hidden;
      height: 40px;
      position: relative;
      z-index: 999999;
    `;
  
    const tickerContent = document.createElement('div');
    tickerContent.id = 'tickerContent';
    tickerContent.style.cssText = `
      position: absolute;
      white-space: nowrap;
      height: 100%;
      display: flex;
      align-items: center;
      will-change: transform;
      transform: translateX(0);
    `;
  
    const tempSpan = document.createElement('span');
    tempSpan.textContent = settings.announcementText;
    tempSpan.style.cssText = `
      display: inline-block;
      padding: 0 3rem;
      visibility: hidden;
      position: absolute;
    `;
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
  
    const viewportWidth = window.innerWidth;
    const copiesNeeded = Math.ceil((viewportWidth * 3) / textWidth) + 2;
  
    for (let i = 0; i < copiesNeeded; i++) {
      const textSpan = document.createElement('span');
      textSpan.textContent = settings.announcementText;
      textSpan.style.cssText = `
        display: inline-block;
        padding: 0 3rem;
      `;
      tickerContent.appendChild(textSpan);
    }
  
    bar.appendChild(tickerContent);
  
    const possibleSelectors = [
      '.header',
      'header[role="banner"]',
      'nav.navbar',
      '#navbar',
      'header.dev3-darkblue',              // Assayl theme primary header
      '.dev3-darkblue',                    // Assayl theme header fallback
      '.dev3-main.border-bottom.header-top', // Assayl theme main header
      '.dev3-main',                        // Assayl theme main container
      '#fixed-header'                      // Assayl theme fixed header
  ];
  
  let targetLocation = null;
let themeDetected = 'unknown';

for (const selector of possibleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
        targetLocation = element;
        
        // Detect theme based on selector
        if (selector.includes('dev3')) {
            themeDetected = 'assayl';
        } else {
            themeDetected = 'standard';
        }
        break;
    }
}
  
if (targetLocation) {
  if (themeDetected === 'assayl') {
      // For Assayl theme, insert at the very top of the header
      if (targetLocation.classList.contains('dev3-darkblue') || 
          targetLocation.classList.contains('dev3-main')) {
          targetLocation.insertBefore(bar, targetLocation.firstChild);
      } else {
          targetLocation.parentNode.insertBefore(bar, targetLocation);
      }
  } else {
      // For standard themes (Soft, Perfect, etc.)
      targetLocation.insertBefore(bar, targetLocation.firstChild);
  }
} else {
  document.body.insertBefore(bar, document.body.firstChild);
}
  
    let currentPosition = 0;
    let lastTimestamp = 0;
    let animationId;
    let isPaused = false;
  
    const minSpeed = 10;
    const maxSpeed = 100;
    const speedRange = maxSpeed - minSpeed;
    const speedPercentage = (60 - settings.announcementSpeed) / 55;
    const pixelsPerSecond = minSpeed + (speedRange * speedPercentage);
  
    function updateAnimation(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      if (!isPaused) {
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        
        const movement = pixelsPerSecond * deltaTime;
        currentPosition += movement;
  
        if (currentPosition >= textWidth) {
          currentPosition = currentPosition % textWidth;
          
          const firstItem = tickerContent.children[0];
          tickerContent.appendChild(firstItem.cloneNode(true));
          tickerContent.removeChild(firstItem);
        }
  
        tickerContent.style.transform = `translate3d(${currentPosition}px, 0, 0)`;
      }
  
      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(updateAnimation);
    }
  
    setTimeout(() => {
      lastTimestamp = 0;
      animationId = requestAnimationFrame(updateAnimation);
    }, 100);
  
    bar.addEventListener('mouseenter', () => {
      isPaused = true;
    });
  
    bar.addEventListener('mouseleave', () => {
      isPaused = false;
      lastTimestamp = 0;
    });
  
    function cleanup() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    }
  
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        lastTimestamp = 0;
      }
    });
  
    window.addEventListener('resize', () => {
      const newViewportWidth = window.innerWidth;
      const newCopiesNeeded = Math.ceil((newViewportWidth * 3) / textWidth) + 2;
  
      while (tickerContent.children.length < newCopiesNeeded) {
        const clone = tickerContent.children[0].cloneNode(true);
        tickerContent.appendChild(clone);
      }
  
      currentPosition = 0;
      lastTimestamp = 0;
      tickerContent.style.transform = `translate3d(${currentPosition}px, 0, 0)`;
    });
  
    window.addEventListener('unload', cleanup);
  }
  
  async function initializeAnnouncementBar() {
    const settings = await fetchAnnouncementSettings();
    if (settings && settings.announcementEnabled) {
      createAnnouncementBar({
        ...settings,
        announcementSpeed: Math.max(5, Math.min(60, settings.announcementSpeed))
      });
    }
  }
  
  initializeAnnouncementBar();
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && !document.getElementById('hmstudio-announcement-bar')) {
        initializeAnnouncementBar();
        break;
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  }

// =============== SMART CART FEATURE ===============
if (params.smartCart) {
  console.log('Initializing Smart Cart feature');

  function getCurrentLanguage() {
    return document.documentElement.lang || 'ar';
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  const SmartCart = {
    settings: null,
    campaigns: [],
    currentProductId: null,
    activeTimers: new Map(),
    updateInterval: null,
    originalDurations: new Map(),
    
    async fetchCampaigns() {
      try {
        const response = await fetch(`https://europe-west3-hmstudio-85f42.cloudfunctions.net/getSmartCartData?storeId=${storeId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.campaigns = data.activeCampaigns || [];
        return this.campaigns;
      } catch (error) {
        return [];
      }
    },
    
    createStickyCart() {
      if (this.stickyCartElement) {
        this.stickyCartElement.remove();
      }
    
      const container = document.createElement('div');
      container.id = 'hmstudio-sticky-cart';
      container.style.cssText = `
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
        padding: ${isMobile() ? '12px' : '20px'};
        z-index: 999999;
        display: none;
        direction: ${getCurrentLanguage() === 'ar' ? 'rtl' : 'ltr'};
        height: ${isMobile() ? 'auto' : '100px'};
      `;

      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${isMobile() ? '8px' : '15px'};
        flex-wrap: ${isMobile() ? 'wrap' : 'nowrap'};
      `;

      const quantityContainer = document.createElement('div');
      quantityContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        width: ${isMobile() ? '100%' : 'auto'};
        background: #f8f8f8;
        border-radius: 8px;
        padding: ${isMobile() ? '8px 12px' : '4px'};
      `;

      const quantityLabel = document.createElement('span');
      quantityLabel.textContent = getCurrentLanguage() === 'ar' ? 'الكمية:' : 'Quantity:';
      quantityLabel.style.cssText = `
        font-size: ${isMobile() ? '14px' : '12px'};
        color: #666;
        ${isMobile() ? 'min-width: 60px;' : ''}
      `;

      const quantityWrapper = document.createElement('div');
      quantityWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f5f5f5;
        border-radius: 4px;
        padding: 4px;
        ${isMobile() ? 'flex: 0 0 auto;' : ''}
      `;
      const decreaseBtn = document.createElement('button');
      decreaseBtn.textContent = '-';
      decreaseBtn.style.cssText = `
        width: ${isMobile() ? '40px' : '28px'};
        height: ${isMobile() ? '40px' : '28px'};
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f8f8;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        cursor: pointer;
        font-size: ${isMobile() ? '18px' : '16px'};
        color: #666;
        transition: all 0.2s ease;
        user-select: none;
        flex-shrink: 0;
      `;
    
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.min = '1';
      quantityInput.max = '10';
      quantityInput.value = '1';
      quantityInput.style.cssText = `
        width: ${isMobile() ? '60px' : '40px'};
        height: ${isMobile() ? '40px' : '28px'};
        text-align: center;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        background: white;
        font-size: ${isMobile() ? '16px' : '14px'};
        -moz-appearance: textfield;
        -webkit-appearance: none;
        margin: 0;
        padding: 0;
        ${isMobile() ? 'flex: 0 0 60px;' : ''};
      `;
    
      const increaseBtn = document.createElement('button');
      increaseBtn.textContent = '+';
      increaseBtn.style.cssText = `
        width: ${isMobile() ? '40px' : '28px'};
        height: ${isMobile() ? '40px' : '28px'};
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f8f8;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        cursor: pointer;
        font-size: ${isMobile() ? '18px' : '16px'};
        color: #666;
        transition: all 0.2s ease;
        user-select: none;
        flex-shrink: 0;
      `;
    
      const addButtonHoverEffects = (button) => {
        button.addEventListener('mouseover', () => {
          button.style.background = '#f0f0f0';
        });
        button.addEventListener('mouseout', () => {
          button.style.background = '#f8f8f8';
        });
        button.addEventListener('mousedown', () => {
          button.style.background = '#e8e8e8';
        });
        button.addEventListener('mouseup', () => {
          button.style.background = '#f0f0f0';
        });
      };

      addButtonHoverEffects(decreaseBtn);
      addButtonHoverEffects(increaseBtn);
    
      const updateQuantity = (value) => {
        quantityInput.value = value;
        const originalSelect = document.querySelector('select#product-quantity') || 
                              document.querySelector('.select-quantity') ||     // Assayl theme
                              document.querySelector('#product-quantity');      // Fallback
        
        if (originalSelect) {
          originalSelect.value = value;
          const event = new Event('change', { bubbles: true });
          originalSelect.dispatchEvent(event);
        }
      };
    
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          updateQuantity(currentValue - 1);
        }
      });
    
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
          updateQuantity(currentValue + 1);
        }
      });
    
      quantityInput.addEventListener('change', (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10) value = 10;
        updateQuantity(value);
      });

      quantityInput.addEventListener('focus', (e) => {
        e.preventDefault();
        if (isMobile()) {
          quantityInput.blur();
        }
      });
    
      const addButton = document.createElement('button');
      addButton.textContent = getCurrentLanguage() === 'ar' ? 'أضف للسلة' : 'Add to Cart';
      addButton.style.cssText = `
        background-color: var(--mainColor, var(--theme-primary, #00b286));
        color: white;
        border: none;
        border-radius: 8px;
        height: ${isMobile() ? '48px' : '60px'};
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition: opacity 0.3s ease;
        flex: 1;
        font-size: ${isMobile() ? '16px' : '16px'};
      `;

      addButton.addEventListener('mouseover', () => addButton.style.opacity = '0.9');
      addButton.addEventListener('mouseout', () => addButton.style.opacity = '1');
      
      addButton.addEventListener('click', () => {
        const originalSelect = document.querySelector('select#product-quantity') || 
                              document.querySelector('.select-quantity') ||
                              document.querySelector('#product-quantity');
        
        if (originalSelect) {
          originalSelect.value = quantityInput.value;
          const event = new Event('change', { bubbles: true });
          originalSelect.dispatchEvent(event);
        }
      
        // For Assayl theme, prioritize the desktop add to cart button
        const originalButton = document.querySelector('.hide-on-mobile[onclick*="productAddToCart"]') ||     // Assayl desktop button
                               document.querySelector('.d-flex.gap-3 button[onclick*="productAddToCart"]') || // Assayl desktop alternative
                               document.querySelector('.btn.btn-add-to-cart') ||                             // Soft/Perfect themes
                               document.querySelector('button[onclick*="productAddToCart"]') ||               // Assayl fallback
                               document.querySelector('.btn-add-to-cart');                                   // Generic fallback

        
        if (originalButton) {
          setTimeout(() => {
            if (originalButton.getAttribute('onclick')) {
              originalButton.click();
            } else if (window.productAddToCart && typeof window.productAddToCart === 'function') {
              window.productAddToCart();
            } else {
              originalButton.click();
            }
          }, 100);
        }
      });

      quantityWrapper.appendChild(decreaseBtn);
      quantityWrapper.appendChild(quantityInput);
      quantityWrapper.appendChild(increaseBtn);
      quantityContainer.appendChild(quantityLabel);
      quantityContainer.appendChild(quantityWrapper);
    
      wrapper.appendChild(quantityContainer);
      wrapper.appendChild(addButton);
      container.appendChild(wrapper);
      document.body.appendChild(container);
    
      this.stickyCartElement = container;

      window.addEventListener('scroll', () => {
        // For Assayl theme, prioritize the desktop add to cart button (not mobile)
        const originalButton = document.querySelector('.hide-on-mobile[onclick*="productAddToCart"]') ||     // Assayl desktop button
                               document.querySelector('.d-flex.gap-3 button[onclick*="productAddToCart"]') || // Assayl desktop alternative
                               document.querySelector('.btn.btn-add-to-cart') ||                             // Soft/Perfect themes
                               document.querySelector('button[onclick*="productAddToCart"]') ||               // Assayl fallback
                               document.querySelector('.btn-add-to-cart');                                   // Generic fallback
                               
        const originalSelect = document.querySelector('select#product-quantity') || 
                              document.querySelector('.select-quantity') ||
                              document.querySelector('#product-quantity');
        
        if (!originalButton) return;
      
        const buttonRect = originalButton.getBoundingClientRect();
        const isButtonVisible = buttonRect.top >= 0 && buttonRect.bottom <= window.innerHeight;
        
        if (!isButtonVisible) {
          container.style.display = 'block';
          if (originalSelect) {
            quantityInput.value = originalSelect.value;
          }
        } else {
          container.style.display = 'none';
        }
      });
    },

    findActiveCampaignForProduct(productId) {
      const now = new Date();

      const activeCampaign = this.campaigns.find(campaign => {

        if (!campaign.products || !Array.isArray(campaign.products)) {
          return false;
        }
    
        const hasProduct = campaign.products.some(p => {
          const match = p.id === productId;
          return match;
        });
                
        if (!hasProduct) {
          return false;
        }
    
        let endTime;
        try {
          endTime = campaign.endTime?._seconds ? 
            new Date(campaign.endTime._seconds * 1000) :
            new Date(campaign.endTime.seconds * 1000);
        } catch (error) {
          return false;
        }
    
        if (!(endTime instanceof Date && !isNaN(endTime))) {
          return false;
        }

        if (campaign.timerSettings.autoRestart && now > endTime) {
          const startTime = campaign.startTime?._seconds ? 
            new Date(campaign.startTime._seconds * 1000) :
            new Date(campaign.startTime.seconds * 1000);
          
          const originalDuration = endTime - startTime;
          const timeSinceStart = now - startTime;
          const cycles = Math.floor(timeSinceStart / originalDuration);
          endTime = new Date(startTime.getTime() + (cycles + 1) * originalDuration);
        }
        const isActive = hasProduct && (now <= endTime || campaign.timerSettings?.autoRestart) && campaign.status === 'active';
        
        return isActive;
      });
    
      if (activeCampaign) {
      } else {
      }
    
      return activeCampaign;
    },

    createCountdownTimer(campaign, productId) {
      const existingTimer = document.getElementById(`hmstudio-countdown-${productId}`);
      if (existingTimer) {
        existingTimer.remove();
        if (this.activeTimers.has(productId)) {
          clearInterval(this.activeTimers.get(productId));
          this.activeTimers.delete(productId);
        }
      }
    
      const container = document.createElement('div');
      container.id = `hmstudio-countdown-${productId}`;
      container.style.cssText = `
        background: ${campaign.timerSettings.backgroundColor};
        color: ${campaign.timerSettings.textColor};
        padding: ${isMobile() ? '8px 10px' : '12px 15px'};
        margin: ${isMobile() ? '10px 0' : '15px 0'};
        border-radius: 8px;
        text-align: center;
        direction: ${getCurrentLanguage() === 'ar' ? 'rtl' : 'ltr'};
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${isMobile() ? '8px' : '12px'};
        font-size: ${isMobile() ? '12px' : '14px'};
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex-wrap: ${isMobile() ? 'wrap' : 'nowrap'};
        width: ${isMobile() ? '100%' : 'auto'};
      `;
    
      const textElement = document.createElement('span');
      const timerText = getCurrentLanguage() === 'ar' ? 
        campaign.timerSettings.textAr : 
        campaign.timerSettings.textEn;
      textElement.textContent = timerText;
      textElement.style.cssText = `
        font-weight: 500;
        ${isMobile() ? 'width: 100%; margin-bottom: 4px;' : ''}
      `;
        
      const timeElement = document.createElement('div');
      timeElement.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.15);
        ${isMobile() ? 'width: 100%; justify-content: center;' : ''}
      `;
    
      container.appendChild(textElement);
      container.appendChild(timeElement);
  
      let endTime = campaign.endTime?._seconds ? 
        new Date(campaign.endTime._seconds * 1000) :
        new Date(campaign.endTime.seconds * 1000);
    
      let startTime = campaign.startTime?._seconds ? 
        new Date(campaign.startTime._seconds * 1000) :
        new Date(campaign.startTime.seconds * 1000);
    
      if (!startTime || isNaN(startTime.getTime())) {
        startTime = campaign.createdAt?._seconds ? 
          new Date(campaign.createdAt._seconds * 1000) :
          campaign.createdAt?.seconds ?
            new Date(campaign.createdAt.seconds * 1000) :
            new Date();
      }
    
      const originalDuration = endTime - startTime;
    
      this.activeTimers.set(productId, {
        element: timeElement,
        endTime: endTime,
        campaign: campaign,
        originalDuration: originalDuration,
        isFlashing: false,
        autoRestart: campaign.timerSettings?.autoRestart || false
      });
    
      return container;
    },

    createProductCardTimer(campaign, productId) {
      const existingTimer = document.getElementById(`hmstudio-card-countdown-${productId}`);
      if (existingTimer) {
        return existingTimer;
      }
    
      const container = document.createElement('div');
      container.id = `hmstudio-card-countdown-${productId}`;
      container.style.cssText = `
        background: ${campaign.timerSettings.backgroundColor};
        color: ${campaign.timerSettings.textColor};
        padding: 4px;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;
        text-align: center;
        direction: ${getCurrentLanguage() === 'ar' ? 'rtl' : 'ltr'};
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: ${isMobile() ? '10px' : '12px'};
        width: 100%;
        overflow: hidden;
      `;
    
      const timeElement = document.createElement('div');
      timeElement.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: ${isMobile() ? '2px' : '4px'};
      `;
    
      container.appendChild(timeElement);
      let endTime = campaign.endTime?._seconds ? 
        new Date(campaign.endTime._seconds * 1000) :
        new Date(campaign.endTime.seconds * 1000);
      let startTime = campaign.startTime?._seconds ? 
        new Date(campaign.startTime._seconds * 1000) :
        new Date(campaign.startTime.seconds * 1000);
      if (!startTime || isNaN(startTime.getTime())) {
        startTime = campaign.createdAt?._seconds ? 
          new Date(campaign.createdAt._seconds * 1000) :
          campaign.createdAt?.seconds ?
            new Date(campaign.createdAt.seconds * 1000) :
            new Date();
      }
      const originalDuration = endTime - startTime;
      this.activeTimers.set(`card-${productId}`, {
        element: timeElement,
        endTime: endTime,
        campaign: campaign,
        originalDuration: originalDuration,
        isFlashing: false,
        autoRestart: campaign.timerSettings?.autoRestart || false
      });
    
      return container;
    },
    addFlashingStyleIfNeeded() {
      if (!document.getElementById('countdown-flash-animation')) {
        const style = document.createElement('style');
        style.id = 'countdown-flash-animation';
        style.textContent = `
          @keyframes countdown-flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .countdown-flash {
            animation: countdown-flash 1s ease-in-out infinite;
          }
        `;
        document.head.appendChild(style);
      }
    },

    updateAllTimers() {
      this.addFlashingStyleIfNeeded();
      const now = new Date();
      
      this.activeTimers.forEach((timer, id) => {
        if (!timer.element || !timer.endTime) return;
  
        let timeDiff = timer.endTime - now;
        if (timeDiff <= 0 && timer.campaign?.timerSettings?.autoRestart && timer.originalDuration) {
          const cyclesPassed = Math.floor(Math.abs(timeDiff) / timer.originalDuration) + 1;
          const newEndTime = new Date(timer.endTime.getTime() + (cyclesPassed * timer.originalDuration));
          timer.endTime = newEndTime;
          timeDiff = newEndTime - now;
          timer.isFlashing = false;
        } else if (timeDiff <= 0 && !timer.campaign?.timerSettings?.autoRestart) {
          const elementId = id.startsWith('card-') ? 
            `hmstudio-card-countdown-${id.replace('card-', '')}` :
            `hmstudio-countdown-${id}`;
          const element = document.getElementById(elementId);
          if (element) element.remove();
          this.activeTimers.delete(id);
          return;
        }
        const isLastFiveMinutes = timeDiff <= 300000;
      if (isLastFiveMinutes && !timer.isFlashing) {
        timer.isFlashing = true;
      } else if (!isLastFiveMinutes && timer.isFlashing) {
        timer.isFlashing = false;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      let html = `
        <div class="countdown-units-wrapper ${timer.isFlashing ? 'countdown-flash' : ''}" style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${id.startsWith('card-') ? '2px' : '4px'};
          transform: scale(${id.startsWith('card-') ? (isMobile() ? 0.85 : 1) : 1});
          flex-wrap: ${id.startsWith('card-') ? 'wrap' : 'nowrap'};
          ${id.startsWith('card-') ? 'max-width: 100%; padding: 2px;' : ''}
        ">
      `;

      const timeUnits = [
        { value: days, label: getCurrentLanguage() === 'ar' ? 'ي' : 'd' },
        { value: hours, label: getCurrentLanguage() === 'ar' ? 'س' : 'h' },
        { value: minutes, label: getCurrentLanguage() === 'ar' ? 'د' : 'm' },
        { value: seconds, label: getCurrentLanguage() === 'ar' ? 'ث' : 's' }
      ];

      timeUnits.forEach((unit, index) => {
        html += `
          <div class="hmstudio-countdown-unit" style="
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
            gap: ${id.startsWith('card-') ? '1px' : '2px'};
            ${index < timeUnits.length - 1 ? `margin-${getCurrentLanguage() === 'ar' ? 'left' : 'right'}: ${id.startsWith('card-') ? '2px' : '4px'};` : ''}
            ${id.startsWith('card-') && index % 2 === 1 ? 'margin-right: 8px;' : ''}
          ">
            <span style="
              font-weight: bold;
              min-width: ${id.startsWith('card-') ? '14px' : '20px'};
              text-align: center;
              font-size: ${id.startsWith('card-') ? (isMobile() ? '11px' : '12px') : (isMobile() ? '12px' : '14px')};
            ">${String(unit.value).padStart(2, '0')}</span>
            <span style="
              font-size: ${id.startsWith('card-') ? (isMobile() ? '9px' : '10px') : (isMobile() ? '10px' : '12px')};
              opacity: 0.8;
            ">${unit.label}</span>
            ${index < timeUnits.length - 1 ? `
              <span style="
                margin-${getCurrentLanguage() === 'ar' ? 'right' : 'left'}: ${id.startsWith('card-') ? '2px' : '4px'};
                opacity: 0.8;
              ">:</span>
            ` : ''}
          </div>
        `;
      });

      html += '</div>';
      timer.element.innerHTML = html;
    });
  },

    setupProductCardTimers() {
      
      const productCardSelectors = [
        '.product-item.position-relative', // Soft theme
        '.card.card-product',              // Perfect theme
        '.product.product-1',  // Assayl theme - main product pages
        'product product-1 ',
        'col-md-3 col-6 ',
        '.col-md-3 col-6 ',
        '.product.position-relative',  // Assayl theme - carousel/slider products
        'product position-relative',
        'item text-center slick-slide slick-active',
        '.item text-center slick-slide slick-active'
    ];


    
      let allProductCards = [];
      for (const selector of productCardSelectors) {
        const cards = document.querySelectorAll(selector);
        if (cards.length) {
          allProductCards = Array.from(cards);
          break;
        }
      }
      allProductCards.forEach(card => {
        const timers = card.querySelectorAll('[id^="hmstudio-card-countdown-"]');
        if (timers.length > 1) {
          for (let i = 1; i < timers.length; i++) {
            timers[i].remove();
          }
        }
      });
    
      allProductCards.forEach(card => {
        let productId = null;
        const idSelectors = [
          '[data-wishlist-id]',
          'input[name="product_id"]',
          '#product-id',
          '.js-add-to-cart',
          'form#product-form input#product-id',
          '#product-form #product-id',
        ];
    
        for (const idSelector of idSelectors) {
          const element = card.querySelector(idSelector);
          if (element) {
            productId = element.getAttribute('data-wishlist-id') || 
                       element.getAttribute('onclick')?.match(/\'(.*?)\'/)?.[1] || 
                       element.value;
            break;
          }
        }
    
        if (!productId) return;
        const existingTimer = document.getElementById(`hmstudio-card-countdown-${productId}`);
        if (existingTimer) return;
        
        const activeCampaign = this.findActiveCampaignForProduct(productId);
        if (!activeCampaign) return;
    
        const timer = this.createProductCardTimer(activeCampaign, productId);

// Perfect theme
const cardBody = card.querySelector('.card-body');
if (cardBody) {
  if (!document.getElementById(`hmstudio-card-countdown-${productId}`)) {
    cardBody.parentNode.insertBefore(timer, cardBody);
  }
  return;
}

// Soft theme
const productTitle = card.querySelector('.product-title');
if (productTitle) {
  if (!document.getElementById(`hmstudio-card-countdown-${productId}`)) {
    productTitle.parentNode.insertBefore(timer, productTitle);
  }
  return;
}

// Assayl theme - NEW ADDITION
const productBottom = card.querySelector('.product-bottom, .product-details, product-bottom product-style-2 pt-2, .product-bottom product-style-2 pt-2, product-details p-2 pb-2 bg-white, .product-details p-2 pb-2 bg-white');
if (productBottom) {
  if (!document.getElementById(`hmstudio-card-countdown-${productId}`)) {
    productBottom.parentNode.insertBefore(timer, productBottom);
  }
  return;
}
      });
    },

    setupProductTimer() {
      let productId = null;
      
      const idSelectors = [
        {
          selector: '#product-parent-id',
          attribute: 'value'
        },
        {
          selector: '#product-form input[name="product_id"]',
          attribute: 'value'
        },
        {
          selector: 'form#product-form input#product-id',
          attribute: 'value'
        },
        {
          selector: '#product-form #product-id',
          attribute: 'value'
        },
        {
          selector: 'input#product-id',
          attribute: 'value'
        }
      ];
      
      for (const {selector, attribute} of idSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          productId = element.getAttribute(attribute) || element.value;
          break;
        }
      }
      
      if (!productId) {
        return;
      }
    
      this.currentProductId = productId;
      const activeCampaign = this.findActiveCampaignForProduct(productId);
    
      if (!activeCampaign) return;
    
      const timer = this.createCountdownTimer(activeCampaign, productId);
    
      // Assayl theme timer insertion
      const assaylPriceContainer = document.querySelector('.price.d-flex.align-items-center');
      if (assaylPriceContainer) {
        assaylPriceContainer.parentNode.insertBefore(timer, assaylPriceContainer);
        return;
      }
    
      // Try additional Assayl selectors
      const assaylPrice2 = document.querySelector('h3.fw-bold.text-dark-1.product-formatted-price');
      if (assaylPrice2) {
        assaylPrice2.parentNode.insertBefore(timer, assaylPrice2);
        return;
      }
    
      const assaylDetailsData = document.querySelector('.details-product-data');
      if (assaylDetailsData) {
        const priceSection = assaylDetailsData.querySelector('.price.d-flex.align-items-center');
        if (priceSection) {
          priceSection.parentNode.insertBefore(timer, priceSection);
          return;
        }
      }
    
      // Perfect theme fallback
      const cardElement = document.querySelector('.card.mb-3.border-secondary.border-opacity-10.shadow-sm');
      if (cardElement) {
        cardElement.parentNode.insertBefore(timer, cardElement.nextSibling);
      } else {
        // Soft theme and other fallbacks
        const insertionPoints = [
          {
            container: '.js-product-price',
            method: 'before'
          },
          {
            container: '.product-formatted-price',
            method: 'before'
          },
          {
            container: '.js-details-section',
            method: 'prepend'
          },
          {
            container: '.js-product-old-price',
            method: 'before'
          },
          {
            container: '.hmstudio-cart-buttons',
            method: 'before'
          }
        ];
    
        for (const point of insertionPoints) {
          const container = document.querySelector(point.container);
          if (container) {
            if (point.method === 'before') {
              container.parentNode.insertBefore(timer, container);
            } else {
              container.insertBefore(timer, container.firstChild);
            }
            break;
          }
        }
      }
    
      this.createStickyCart();
    
      if (this.activeTimers.size > 0) {
        this.startTimerUpdates();
      }
    },
    
    startTimerUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      this.updateInterval = setInterval(() => this.updateAllTimers(), 1000);
    },
    
    stopTimerUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },
    
    async initialize() {
      await this.fetchCampaigns();
      
      this.stopTimerUpdates();
      
      const isProductPage = document.querySelector('.product.products-details-page') || 
                     document.querySelector('.js-details-section') ||
                     document.querySelector('#productId') ||
                     document.querySelector('.details-product-data') ||
                     document.querySelector('#product-form') ||
                     document.querySelector('.products-details.mb-4.mb-lg-5') ||
                     document.querySelector('.products-details') ||
                     document.querySelector('.product.products-details-page.pt-3.pb-5') ||
                     document.querySelector('.col-product-info') ||
                     document.querySelector('.col-product-image-wrapper') ||
                     document.querySelector('.product-formatted-price') ||
                     document.querySelector('.product-buttons') ||
                     document.querySelector('h1.product-title');
    
              if (isProductPage) {
                      this.createStickyCart();
                      
                      // Check if sticky cart was created
                      const stickyCartElement = document.getElementById('hmstudio-sticky-cart');
                      
                      if (stickyCartElement) {
                      }

        let productId = null;
        
        // Better theme detection - more specific to Assayl
        const isAssaylTheme = document.querySelector('.details-product-data') || 
                             document.querySelector('.col-product-info');
    
        if (isAssaylTheme) {
          // For Assayl: Try parent ID first, then regular ID
          const productParentInput = document.querySelector('#product-parent-id');
          const productIdInput = document.querySelector('#product-id');
    
          if (productParentInput && productParentInput.value) {
            productId = productParentInput.value;
          } else if (productIdInput && productIdInput.value) {
            productId = productIdInput.value;
          }
        } else {
          // For Soft/Perfect: Use original wishlist logic
          const wishlistBtn = document.querySelector('[data-wishlist-id]');
          const productForm = document.querySelector('form[data-product-id]');
          productId = wishlistBtn?.getAttribute('data-wishlist-id') || 
                     productForm?.getAttribute('data-product-id');
        }
        
        if (productId) {
          const activeCampaign = this.findActiveCampaignForProduct(productId);
          if (activeCampaign) {
            this.setupProductTimer();
            if (this.activeTimers.size > 0) {
              this.startTimerUpdates();
            }
          }
        } else {
          this.setupProductTimer();
        }
      } else {
        const productCards = document.querySelectorAll('.product-item, .card.card-product, .product.product-1, .product.position-relative');
        if (productCards.length > 0) {
          this.setupProductCardTimers();
          if (this.activeTimers.size > 0) {
            this.startTimerUpdates();
          }
        }
      }

      let timeout;
  const observer = new MutationObserver((mutations) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      if (isProductPage) {
        if (!document.getElementById('hmstudio-sticky-cart')) {
          this.createStickyCart();
        }

        if (this.currentProductId && !document.getElementById(`hmstudio-countdown-${this.currentProductId}`)) {
          this.setupProductTimer();
        }
      } else {
        const currentCards = document.querySelectorAll('.product-item, .card.card-product, .product.product-1, .product.position-relative');
        if (currentCards.length > 0) {
          currentCards.forEach(card => {
            const timers = card.querySelectorAll('[id^="hmstudio-card-countdown-"]');
            if (timers.length > 1) {
              for (let i = 1; i < timers.length; i++) {
                timers[i].remove();
              }
            }
          });
          
          this.setupProductCardTimers();
        }
      }
    }, 100);
  });

  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
      if (this.activeTimers.size > 0) {
        this.startTimerUpdates();
      }
    }
  };

  window.addEventListener('beforeunload', () => {
    SmartCart.stopTimerUpdates();
  });
  window.addEventListener('resize', () => {
    if (SmartCart.stickyCartElement) {
      SmartCart.createStickyCart();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await SmartCart.initialize();
    });
  } else {
    SmartCart.initialize();
  }
}

// =============== SLIDING CART FEATURE ===============
if (params.slidingCart) {
  console.log('Initializing Sliding Cart feature');
  
  function getCurrentLanguage() {
    return document.documentElement.lang || "ar"
  }

const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

const couponMessages = {
  invalidCoupon: {
    ar: "القسيمة غير صالحة",
    en: "Invalid coupon code",
  },
  expiredCoupon: {
    ar: "انتهت صلاحية القسيمة",
    en: "Coupon has expired",
  },
  productNotEligible: {
    ar: "هذه القسيمة غير متوفرة للمنتجات المختارة",
    en: "This coupon is not available for the selected products",
  },
  minimumNotMet: {
    ar: "لم يتم الوصول إلى الحد الأدنى للطلب",
    en: "Minimum order amount not met",
  },
  alreadyUsed: {
    ar: "تم استخدام هذه القسيمة من قبل",
    en: "This coupon has already been used",
  },
  success: {
    ar: "تم تطبيق القسيمة بنجاح",
    en: "Coupon applied successfully",
  },
}

  const SlidingCart = {
    cartElement: null,
    isOpen: false,

    fetchSettings: async () => {
      try {
        const response = await fetch(
          `https://europe-west3-hmstudio-85f42.cloudfunctions.net/getSlidingCartSettings?storeId=${storeId}`,
        )
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.statusText}`)
        }
        const data = await response.json()
        return data
      } catch (error) {
        return null
      }
    },

    createCartStructure: function () {
      const currentLang = getCurrentLanguage()
      const isRTL = currentLang === "ar"

      const container = document.createElement("div")
      container.id = "hmstudio-sliding-cart"
      container.className = "hmstudio-cart-container"
      container.style.cssText = `
  position: fixed;
  top: 0;
  ${isRTL ? "right" : "left"}: 100%;
  width: ${this.isMobileDevice() ? '100vw' : '400px'};
  height: ${this.isMobileDevice() ? 'calc(100vh - 50px)' : '100vh'};
  background: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  transition: transform 300ms ease;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  direction: ${isRTL ? "rtl" : "ltr"};
  ${this.isMobileDevice() ? 'bottom: 50px;' : ''}
`

      const header = document.createElement("div")
      header.className = "hmstudio-cart-header"
      header.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      `

      const title = document.createElement("h2")
      title.className = "hmstudio-cart-title"
      title.textContent = currentLang === "ar" ? "سلة التسوق" : "Shopping Cart"
      title.style.cssText = `
        margin: 0;
        font-size: 1.25rem;
        font-weight: bold;
      `

      const closeButton = document.createElement("button")
      closeButton.className = "hmstudio-cart-close"
      closeButton.innerHTML = "✕"
      closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 5px;
        opacity: 0.6;
        transition: opacity 0.3s;
      `
      closeButton.addEventListener("mouseover", () => (closeButton.style.opacity = "1"))
      closeButton.addEventListener("mouseout", () => (closeButton.style.opacity = "0.6"))
      closeButton.addEventListener("click", () => this.closeCart())

      header.appendChild(title)
      header.appendChild(closeButton)

      const content = document.createElement("div")
      content.className = "hmstudio-cart-content"
      content.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      `

      const footer = document.createElement("div")
footer.className = "hmstudio-cart-footer"
footer.style.cssText = `
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: auto;
  flex-shrink: 0;
`

      container.appendChild(header)
      container.appendChild(content)
      container.appendChild(footer)

      const backdrop = document.createElement("div")
      backdrop.id = "hmstudio-sliding-cart-backdrop"
      backdrop.className = "hmstudio-cart-backdrop"
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition: opacity 300ms ease;
        z-index: 999998;
      `

      backdrop.addEventListener("click", () => this.closeCart())

      document.body.appendChild(backdrop)
      document.body.appendChild(container)

      this.cartElement = {
        container,
        content,
        footer,
        backdrop,
      }

      return this.cartElement
    },
    fetchCartData: async () => {
      try {
        let response;
        if (window.vitrin === true) {
          response = await zid.cart.get()
          
          // Vitrin returns cart directly, not wrapped in {status, data}
          if (response && response.products !== undefined) {
            return response;
          } else if (response && response.data && response.data.cart) {
            return response.data.cart;
          }
          throw new Error("Invalid Vitrin response structure");
        } else {
          response = await zid.store.cart.fetch()
          
          if (response.status === "success") {
            return response.data.cart
          }
          throw new Error("Failed to fetch cart data")
        }
      } catch (error) {
        return null
      }
    },

    updateItemQuantity: async function (productId, newQuantity) {
      try {
        
        if (window.vitrin === true) {
          await zid.cart.updateProduct({ product_id: productId, quantity: newQuantity })
        } else {
          await zid.store.cart.updateProduct(productId, newQuantity, productId)
        }
        await this.updateCartDisplay()
      } catch (error) {
      }
    },

    removeItem: async function (productId) {
      try {
        
        if (window.vitrin === true) {
          await zid.cart.removeProduct({ product_id: productId })
        } else {
          await zid.store.cart.removeProduct(productId, productId)
        }
        await this.updateCartDisplay()
      } catch (error) {
      }
    },

    createCartItem: function (item, currentLang) {
      const isArabic = currentLang === "ar"

      const itemElement = document.createElement("div")
      itemElement.className = "hmstudio-cart-item"
      itemElement.style.cssText = `
        display: flex;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        direction: ${isArabic ? "rtl" : "ltr"};
      `

      const imageElement = document.createElement("img")
      imageElement.className = "hmstudio-cart-item-image"
      imageElement.src = item.images?.[0]?.origin || item.images?.[0]?.thumbnail || "/path/to/default-image.jpg"
      imageElement.alt = item.name || ""
      imageElement.style.cssText = `
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      `

      const details = document.createElement("div")
      details.className = "hmstudio-cart-item-details"
      details.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      `

      const name = document.createElement("h3")
      name.className = "hmstudio-cart-item-name"
      name.textContent = item.name || ""
      name.style.cssText = `
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
      `

      const priceContainer = document.createElement("div")
      priceContainer.className = "hmstudio-cart-item-price-container"
      priceContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        flex-direction: ${isArabic ? "row-reverse" : "row"};
      `

      if (item.gross_sale_price && item.gross_price !== item.gross_sale_price) {
        const salePrice = document.createElement("div")
        salePrice.className = "hmstudio-cart-item-sale-price"
        const formattedSalePrice = isArabic
          ? `${item.gross_sale_price.toFixed(2)} ${currentLang === "en" ? "SAR" : "ر.س"}`
          : `${currentLang === "en" ? "SAR" : "ر.س"} ${item.gross_sale_price.toFixed(2)}`
        salePrice.textContent = formattedSalePrice
        salePrice.style.cssText = `
          font-weight: bold;
          color: var(--mainColor, #00b286);
        `

        const originalPrice = document.createElement("div")
        originalPrice.className = "hmstudio-cart-item-original-price"
        const formattedOriginalPrice = isArabic
          ? `${item.gross_price.toFixed(2)} ${currentLang === "en" ? "SAR" : "ر.س"}`
          : `${currentLang === "en" ? "SAR" : "ر.س"} ${item.gross_price.toFixed(2)}`
        originalPrice.textContent = formattedOriginalPrice
        originalPrice.style.cssText = `
          text-decoration: line-through;
          color: #999;
          font-size: 0.9em;
          margin-${isArabic ? "left" : "right"}: 8px;
        `

        if (isArabic) {
          priceContainer.appendChild(originalPrice)
          priceContainer.appendChild(salePrice)
        } else {
          priceContainer.appendChild(salePrice)
          priceContainer.appendChild(originalPrice)
        }
      } else {
        const price = document.createElement("div")
        price.className = "hmstudio-cart-item-price"
        const priceValue = item.gross_price || item.price
        const formattedPrice = isArabic
          ? `${priceValue.toFixed(2)} ${currentLang === "en" ? "SAR" : "ر.س"}`
          : `${currentLang === "en" ? "SAR" : "ر.س"} ${priceValue.toFixed(2)}`
        price.textContent = formattedPrice
        price.style.cssText = `
          font-weight: bold;
          color: var(--mainColor, #00b286);
        `
        priceContainer.appendChild(price)
      }

      const quantityControls = document.createElement("div")
      quantityControls.className = "hmstudio-cart-item-quantity"
      quantityControls.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: auto;
      `

      const createButton = (text, onClick) => {
        const btn = document.createElement("button")
        btn.className = `hmstudio-cart-quantity-${text === "+" ? "increase" : "decrease"}`
        btn.textContent = text
        btn.style.cssText = `
          width: 24px;
          height: 24px;
          padding: 0;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.3s;
        `
        btn.addEventListener("mouseover", () => {
          btn.style.backgroundColor = "#f0f0f0"
        })
        btn.addEventListener("mouseout", () => {
          btn.style.backgroundColor = "transparent"
        })
        btn.addEventListener("click", onClick.bind(this))
        return btn
      }

      const decreaseBtn = createButton("-", () => {
        if (item.quantity > 1) {
          this.updateItemQuantity(item.id, item.quantity - 1)
        }
      })

      const quantity = document.createElement("span")
      quantity.className = "hmstudio-cart-quantity-value"
      quantity.textContent = item.quantity
      quantity.style.cssText = `
        min-width: 20px;
        text-align: center;
      `

      const increaseBtn = createButton("+", () => {
        this.updateItemQuantity(item.id, item.quantity + 1)
      })

      const removeBtn = document.createElement("button")
      removeBtn.className = "hmstudio-cart-item-remove"
      removeBtn.innerHTML = "🗑️"
      removeBtn.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        margin-${isArabic ? "right" : "left"}: auto;
        font-size: 1.2rem;
        opacity: 0.7;
        transition: opacity 0.3s;
      `
      removeBtn.addEventListener("mouseover", () => {
        removeBtn.style.opacity = "1"
      })
      removeBtn.addEventListener("mouseout", () => {
        removeBtn.style.opacity = "0.7"
      })
      removeBtn.addEventListener("click", () => {
        this.removeItem(item.id)
      })

      quantityControls.appendChild(decreaseBtn)
      quantityControls.appendChild(quantity)
      quantityControls.appendChild(increaseBtn)

      details.appendChild(name)
      details.appendChild(priceContainer)
      details.appendChild(quantityControls)

      itemElement.appendChild(imageElement)
      itemElement.appendChild(details)
      itemElement.appendChild(removeBtn)

      return itemElement
    },
    createFooterContent: function (cartData, currentLang) {
      const isArabic = currentLang === "ar"
      const currencySymbol = currentLang === "en" ? "SAR" : "ر.س"
      

      const footer = document.createElement("div")
      footer.className = "hmstudio-cart-footer-content"
      footer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
        direction: ${isArabic ? "rtl" : "ltr"};
      `

      function getErrorType(response) {
        const errorMessage = (response.data?.message || "").toLowerCase()

        if (
          errorMessage.includes("فترة إستخدام الكوبون لم تبدأ بعد أو أنها انتهت") ||
          errorMessage.includes("لم تبدأ بعد أو أنها انتهت") ||
          errorMessage.includes("منتهية الصلاحية") ||
          errorMessage.includes("expired")
        ) {
          return "expiredCoupon"
        }

        if (
          errorMessage.includes("قيمة منتجات") ||
          errorMessage.includes("حد أدنى") ||
          errorMessage.includes("200.00") ||
          errorMessage.includes("يتطلب حد")
        ) {
          return "minimumNotMet"
        }

        if (
          errorMessage.includes("السلة لا تحتوي أي منتج من المنتجات المشمولة") ||
          errorMessage.includes("not eligible") ||
          errorMessage.includes("not applicable")
        ) {
          return "productNotEligible"
        }

        if (
          errorMessage.includes("تم استخدام") ||
          errorMessage.includes("مستخدمة مسبقا") ||
          errorMessage.includes("already used") ||
          errorMessage.includes("used before")
        ) {
          return "alreadyUsed"
        }

        return "invalidCoupon"
      }

      const couponSection = document.createElement("div")
      couponSection.className = "hmstudio-cart-coupon-section"
      couponSection.style.cssText = `
        padding: 15px 0;
      `

      const couponForm = document.createElement("form")
      couponForm.className = "hmstudio-cart-coupon-form"
      couponForm.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
      `

      couponForm.addEventListener("submit", (e) => {
        e.preventDefault()
      })

      const couponMessage = document.createElement("div")
      couponMessage.className = "hmstudio-cart-coupon-message"
      couponMessage.style.cssText = `
        font-size: 0.9rem;
        display: none;
        padding: 8px 12px;
        border-radius: 4px;
        margin-top: 8px;
      `

      const inputContainer = document.createElement("div")
      inputContainer.className = "hmstudio-cart-coupon-input-container"
      inputContainer.style.cssText = `
        display: flex;
        gap: 10px;
      `

      const couponInput = document.createElement("input")
      couponInput.className = "hmstudio-cart-coupon-input"
      couponInput.type = "text"
      couponInput.placeholder = isArabic ? "أدخل رمز القسيمة" : "Enter coupon code"
      couponInput.style.cssText = `
        flex: 1;
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        font-size: 0.9rem;
        transition: border-color 0.3s;
      `

      couponInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          applyButton.click()
        }
      })

      couponInput.addEventListener("focus", () => {
        couponInput.style.borderColor = "var(--theme-primary, #00b286)"
      })

      couponInput.addEventListener("blur", () => {
        couponInput.style.borderColor = "rgba(0, 0, 0, 0.1)"
      })

      function showCouponMessage(type, isArabic) {
        const message = couponMessages[type][isArabic ? "ar" : "en"]
        couponMessage.style.display = "block"
        couponMessage.textContent = message

        if (type === "success") {
          couponMessage.style.cssText = `
            display: block;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 8px;
            background-color: rgba(0, 178, 134, 0.1);
            color: var(--mainColor, #00b286);
          `
          couponInput.value = ""
        } else {
          couponMessage.style.cssText = `
            display: block;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 8px;
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          `
        }
      }

      const applyButton = document.createElement("button")
      applyButton.className = "hmstudio-cart-coupon-apply"
      applyButton.type = "button"
      applyButton.style.cssText = `
        padding: 8px 16px;
        background: var(--mainColor, var(--theme-primary, #00b286));
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 80px;
        justify-content: center;
        transition: opacity 0.3s, background-color 0.3s;
      `

      applyButton.addEventListener("mouseover", () => {
        if (!applyButton.disabled) {
          applyButton.style.opacity = "0.9"
        }
      })

      applyButton.addEventListener("mouseout", () => {
        if (!applyButton.disabled) {
          applyButton.style.opacity = "1"
        }
      })

      const spinner = document.createElement("div")
      spinner.className = "hmstudio-cart-coupon-spinner"
      spinner.style.cssText = `
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: none;
      `

      const buttonText = document.createElement("span")
      buttonText.className = "hmstudio-cart-coupon-button-text"
      buttonText.textContent = isArabic ? "تطبيق" : "Apply"

      applyButton.appendChild(spinner)
      applyButton.appendChild(buttonText)

      applyButton.addEventListener("click", async () => {
        const couponCode = couponInput.value.trim()
        if (!couponCode) return

        spinner.style.display = "block"
        couponInput.disabled = true
        applyButton.disabled = true
        buttonText.style.opacity = "0.7"

        try {
          let response;
          if (window.vitrin === true) {
            response = await zid.cart.applyCoupon({ coupon_code: couponCode })
          } else {
            response = await zid.store.cart.redeemCoupon(couponCode)
          }

          if (response && (response.status === "success" || response.coupon)) {
            showCouponMessage("success", isArabic)
            await this.updateCartDisplay()
          } else if (response?.status === "error" || response?.message) {
            const errorType = getErrorType(response)
            showCouponMessage(errorType, isArabic)
          } else {
            showCouponMessage("success", isArabic)
            await this.updateCartDisplay()
          }
        } catch (error) {
          const errorResponse = {
            data: { message: error.message || "" },
            status: "error",
          }
          const errorType = getErrorType(errorResponse)
          showCouponMessage(errorType, isArabic)
        } finally {
          spinner.style.display = "none"
          couponInput.disabled = false
          applyButton.disabled = false
          buttonText.style.opacity = "1"
        }
      })

      inputContainer.appendChild(couponInput)
      inputContainer.appendChild(applyButton)
      couponForm.appendChild(inputContainer)
      couponForm.appendChild(couponMessage)
      couponSection.appendChild(couponForm)
      if (cartData.coupon) {
        const appliedCouponContainer = document.createElement("div")
        appliedCouponContainer.className = "hmstudio-cart-applied-coupon"
        appliedCouponContainer.style.cssText = `
          margin-top: 10px;
          padding: 12px;
          background-color: rgba(0, 178, 134, 0.1);
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `

        const couponInfo = document.createElement("div")
        couponInfo.className = "hmstudio-cart-coupon-info"
        couponInfo.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 4px;
        `

        const couponTitle = document.createElement("span")
        couponTitle.className = "hmstudio-cart-coupon-title"
        couponTitle.textContent = isArabic ? "القسيمة المطبقة:" : "Applied Coupon:"
        couponTitle.style.cssText = `
          font-size: 0.8rem;
          color: #666;
        `

        const couponCode = document.createElement("span")
        couponCode.className = "hmstudio-cart-coupon-code"
        couponCode.textContent = cartData.coupon.code
        couponCode.style.cssText = `
          font-weight: 500;
          color: var(--mainColor, #00b286);
        `

        const removeButton = document.createElement("button")
        removeButton.className = "hmstudio-cart-coupon-remove"
        removeButton.innerHTML = "✕"
        removeButton.style.cssText = `
          border: none;
          background: none;
          color: #666;
          cursor: pointer;
          padding: 5px;
          font-size: 1.1rem;
          opacity: 0.7;
          transition: opacity 0.3s;
        `

        removeButton.addEventListener("mouseover", () => {
          removeButton.style.opacity = "1"
        })

        removeButton.addEventListener("mouseout", () => {
          removeButton.style.opacity = "0.7"
        })

        removeButton.addEventListener("click", async (e) => {
          e.preventDefault()
          try {
            if (window.vitrin === true) {
              await zid.cart.removeCoupons()
            } else {
              await zid.store.cart.removeCoupon()
            }
            await this.updateCartDisplay()
          } catch (error) {
          }
        })

        couponInfo.appendChild(couponTitle)
        couponInfo.appendChild(couponCode)
        appliedCouponContainer.appendChild(couponInfo)
        appliedCouponContainer.appendChild(removeButton)
        couponForm.appendChild(appliedCouponContainer)
      }

      const originalSubtotal = cartData.products.reduce((acc, product) => {
        const originalPrice = product.gross_price || product.price
        return acc + originalPrice * product.quantity
      }, 0)

      const subtotal = document.createElement("div")
      subtotal.className = "hmstudio-cart-subtotal"
      subtotal.style.cssText = `
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 0.9rem;
        margin-top: 15px;
      `

      const subTotalFormatted = isArabic
        ? `${originalSubtotal.toFixed(2)} ${currencySymbol}`
        : `${currencySymbol} ${originalSubtotal.toFixed(2)}`

      subtotal.innerHTML = `
        <span>${isArabic ? "المجموع الفرعي:" : "Subtotal:"}</span>
        <span>${subTotalFormatted}</span>
      `

      footer.appendChild(subtotal)

      const calculateTotalDiscount = () => {
        let totalDiscount = 0

        cartData.products.forEach((product) => {
          if (product.gross_sale_price && product.gross_sale_price !== product.gross_price) {
            const regularPrice = product.gross_price || 0
            const salePrice = product.gross_sale_price || regularPrice
            totalDiscount += (regularPrice - salePrice) * product.quantity
          }
        })

        if (cartData.coupon && cartData.coupon.discount_amount) {
          totalDiscount += Number.parseFloat(cartData.coupon.discount_amount)
        }

        return totalDiscount
      }

      const totalDiscount = calculateTotalDiscount()
      if (totalDiscount > 0 || (cartData.coupon && cartData.coupon.discount_amount > 0)) {
        const discountInfo = document.createElement("div")
        discountInfo.className = "hmstudio-cart-discount-info"
        discountInfo.style.cssText = `
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          color: var(--mainColor, #00b286);
          font-size: 0.9rem;
        `

        const formattedDiscount = isArabic
          ? `${totalDiscount.toFixed(2)} ${currencySymbol}`
          : `${currencySymbol} ${totalDiscount.toFixed(2)}`

        discountInfo.innerHTML = `
          <span>${isArabic ? "قيمة الخصم:" : "Discount:"}</span>
          <span>${formattedDiscount}</span>
        `

        footer.appendChild(discountInfo)
      }

      if (cartData.tax_percentage > 0) {
        const taxInfo = document.createElement("div")
        taxInfo.className = "hmstudio-cart-tax-info"
        taxInfo.style.cssText = `
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 0.9rem;
          padding: 5px 0;
        `

        const taxAmount = (cartData.products_subtotal * (cartData.tax_percentage / 100)).toFixed(2)
        const formattedTax = isArabic
          ? `${taxAmount} ${currencySymbol} (${cartData.tax_percentage}٪)`
          : `${currencySymbol} ${taxAmount} (${cartData.tax_percentage}%)`

        taxInfo.innerHTML = `
          <span>${isArabic ? "الضريبة:" : "Tax:"}</span>
          <span>${formattedTax}</span>
        `

        footer.appendChild(taxInfo)
      }

      const total = document.createElement("div")
      total.className = "hmstudio-cart-total"
      total.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 1.1rem;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      `

      const formattedTotal = isArabic
        ? `${cartData.total.value.toFixed(2)} ${currencySymbol}`
        : `${currencySymbol} ${cartData.total.value.toFixed(2)}`

      total.innerHTML = `
        <span>${isArabic ? "المجموع:" : "Total:"}</span>
        <span>${formattedTotal}</span>
      `

      footer.appendChild(total)

      const checkoutBtn = document.createElement("button")
      checkoutBtn.className = "hmstudio-cart-checkout-button"
      checkoutBtn.textContent = isArabic ? "إتمام الطلب" : "Checkout"
      checkoutBtn.style.cssText = `
       width: 100%;
       padding: 15px;
       background: var(--mainColor, var(--theme-primary, #00b286));
       color: white;
       border: none;
       border-radius: 4px;
       font-weight: bold;
       cursor: pointer;
       transition: opacity 0.3s;
       margin-top: 15px;
     `

      checkoutBtn.addEventListener("mouseover", () => {
        checkoutBtn.style.opacity = "0.9"
      })

      checkoutBtn.addEventListener("mouseout", () => {
        checkoutBtn.style.opacity = "1"
      })

      checkoutBtn.addEventListener("click", () => {
        const checkoutLink = document.querySelector('a[href="/checkout/choose-address-and-shipping"]')

        if (!checkoutLink || checkoutLink.style.display === "none") {
          const redirectUrl = encodeURIComponent("/checkout/choose-address-and-shipping")
          window.location.href = `/auth/login?redirect_to=${redirectUrl}`
        } else {
          checkoutLink.click()
        }
      })

      footer.appendChild(couponSection)
      footer.appendChild(checkoutBtn)

      return footer
    },

    updateCartDisplay: async function () {
      const cartData = await this.fetchCartData()
      
      if (!cartData) {
        return;
      }

      const currentLang = getCurrentLanguage()
      const { content, footer } = this.cartElement

      content.innerHTML = ""

      if (!cartData.products || cartData.products.length === 0) {
        const emptyMessage = document.createElement("div")
        emptyMessage.className = "hmstudio-cart-empty-message"
        emptyMessage.style.cssText = `
         text-align: center;
         padding: 40px 20px;
         color: rgba(0, 0, 0, 0.5);
       `
        emptyMessage.textContent = currentLang === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"
        content.appendChild(emptyMessage)

        footer.style.display = "none"
      } else {
        cartData.products.forEach((item) => {
          content.appendChild(this.createCartItem(item, currentLang))
        })

        footer.style.display = "block"
        footer.innerHTML = ""
        footer.appendChild(this.createFooterContent(cartData, currentLang))
      }
    },

    openCart: function () {
      
      if (this.isOpen) {
        return;
      }

      if (!this.cartElement) {
        return;
      }

      const currentLang = getCurrentLanguage()
      const isRTL = currentLang === "ar"

      
      this.cartElement.container.style.transform = `translateX(${isRTL ? "100%" : "-100%"})`
      this.cartElement.backdrop.style.opacity = "1"
      this.cartElement.backdrop.style.visibility = "visible"
      document.body.style.overflow = "hidden"
      this.isOpen = true

      
      this.updateCartDisplay()
    },

    closeCart: function () {
      if (!this.isOpen) return

      this.cartElement.container.style.transform = "translateX(0)"
      this.cartElement.backdrop.style.opacity = "0"
      this.cartElement.backdrop.style.visibility = "hidden"
      document.body.style.overflow = ""
      this.isOpen = false
    },

    handleCartUpdates: function () {
      const self = this

      if ((typeof zid === "undefined" || !zid.store || !zid.store.cart) && window.vitrin !== true) {
        const checkZid = setInterval(() => {
          if ((typeof zid !== "undefined" && zid.store && zid.store.cart) || window.vitrin === true) {
            clearInterval(checkZid)
            initializeCartHandler()
          }
        }, 100)

        return
      }

      initializeCartHandler()

      function initializeCartHandler() {
        // For Legacy theme
        if (zid.store && zid.store.cart) {
          const originalAddProduct = zid.store.cart.addProduct
          zid.store.cart.addProduct = async (...args) => {
            try {
              const result = await originalAddProduct.apply(zid.store.cart, args)
              if (result.status === "success") {
                setTimeout(() => {
                  self.openCart()
                  self.updateCartDisplay()
                }, 100)
              }
              return result
            } catch (error) {
              throw error
            }
          }
        }
        
        // For Vitrin theme - wrap ALL cart methods
        if (window.vitrin === true && zid.cart) {
          
          // Wrap addProduct
          const originalAdd = zid.cart.addProduct
          zid.cart.addProduct = async (...args) => {
            try {
              const result = await originalAdd.apply(zid.cart, args)
              setTimeout(() => {
                self.openCart()
                self.updateCartDisplay()
              }, 300)
              return result
            } catch (error) {
              throw error
            }
          }
          
          // Wrap updateProduct
          const originalUpdate = zid.cart.updateProduct
          zid.cart.updateProduct = async (...args) => {
            try {
              const result = await originalUpdate.apply(zid.cart, args)
              setTimeout(() => self.updateCartDisplay(), 100)
              return result
            } catch (error) {
              throw error
            }
          }
          
          // Wrap removeProduct
          const originalRemove = zid.cart.removeProduct
          zid.cart.removeProduct = async (...args) => {
            try {
              console.log('🗑️ Vitrin removeProduct called with args:', args);
              const result = await originalRemove.apply(zid.cart, args)
              console.log('✅ Vitrin removeProduct result:', result);
              setTimeout(() => self.updateCartDisplay(), 100)
              return result
            } catch (error) {
              console.error('❌ Vitrin removeProduct error:', error);
              throw error
            }
          }

          // Wrap applyCoupon
          const originalApplyCoupon = zid.cart.applyCoupon
          zid.cart.applyCoupon = async (params) => {
            try {
              const couponParams = params?.coupon_code ? params : { coupon_code: params };
              const result = await originalApplyCoupon.apply(zid.cart, [couponParams])
              setTimeout(() => self.updateCartDisplay(), 100)
              return result || { status: 'success' }
            } catch (error) {
              return { status: 'error', data: { message: error.message } }
            }
          }

          // Wrap removeCoupons
          const originalRemoveCoupons = zid.cart.removeCoupons
          zid.cart.removeCoupons = async (...args) => {
            try {
              const result = await originalRemoveCoupons.apply(zid.cart, args)
              setTimeout(() => self.updateCartDisplay(), 100)
              return result
            } catch (error) {
              throw error
            }
          }
        }
      }
    },

    setupCartButton: function () {
      const self = this;
      
      // Use event delegation - listen on document for all cart link clicks
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a[href*='/cart']");
        
        if (link) {
          
          // Don't intercept if ctrl/cmd/shift is held (allow new tab/window)
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            return;
          }
          
          e.preventDefault();
          e.stopPropagation();
          self.openCart();
          return;
        }
        
        // Also check for cart buttons/icons
        const cartButton = e.target.closest(".a-shopping-cart");
        if (cartButton) {
          e.preventDefault();
          e.stopPropagation();
          self.openCart();
          return;
        }
        
        // Assayl mobile cart
        const mobileCart = e.target.closest(".nav-mobile .view-cart");
        if (mobileCart) {
          e.preventDefault();
          e.stopPropagation();
          self.openCart();
          return;
        }
      }, true); // Use capture phase to intercept early
      
    },

    isMobileDevice: function () {
      return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },

    initialize: async function () {
      
      const settings = await this.fetchSettings()
      
      if (!settings?.enabled) {
        return
      }

      this.createCartStructure()

      const waitForZid = () => {
        
        const hasVitrinCart = window.vitrin === true && typeof zid !== "undefined" && zid.cart;
        const hasLegacyCart = typeof zid !== "undefined" && zid.store && zid.store.cart;
        
        if (hasVitrinCart || hasLegacyCart) {
          this.handleCartUpdates()
          this.setupCartButton()

          const self = this
const observer = new MutationObserver((mutations) => {
  let shouldSetupButtons = false
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.classList?.contains('nav-mobile') || 
              node.querySelector?.('.nav-mobile') || 
              node.classList?.contains('header-cart') ||
              node.querySelector?.('.header-cart')) {
            shouldSetupButtons = true
          }
        }
      })
    }
  })
  
  if (shouldSetupButtons) {
    setTimeout(() => self.setupCartButton(), 100)
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

        } else {
          setTimeout(waitForZid, 100)
        }
      }

      waitForZid()
    },
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      SlidingCart.initialize.call(SlidingCart)
    })
  } else {
    SlidingCart.initialize.call(SlidingCart)
  }
}

  // =============== UPSELL FEATURE ===============
  if (params.upsell) {
    console.log('Initializing Upsell feature');
    
  const styleTag = document.createElement('style');
  styleTag.textContent = `
  @font-face {font-family: "Teshrin AR+LT Bold"; src: url("//db.onlinewebfonts.com/t/56364258e3196484d875eec94e6edb93.eot"); 
  src: url("//db.onlinewebfonts.com/t/56364258e3196484d875eec94e6edb93.eot?#iefix") format("embedded-opentype"), url("//db.onlinewebfonts.com/t/56364258e3196484d875eec94e6edb93.woff2") format("woff2"), url("//db.onlinewebfonts.com/t/56364258e3196484d875eec94e6edb93.woff") format("woff"), url("//db.onlinewebfonts.com/t/56364258e3196484d875eec94e6edb93.ttf") format("truetype"), url("//db.onlinewebfonts.com/t/56364258e3196484d875eec94e6edb93.svg#Teshrin AR+LT Bold") format("svg"); 
  }
    .hmstudio-upsell-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  
    .hmstudio-upsell-content {
      background: white;
      padding: 40px;
      border-radius: 12px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }
  
    .hmstudio-upsell-content:has(.hmstudio-upsell-products > *:only-child) {
      max-width: 620px;
    }
  
    .hmstudio-upsell-content:has(.hmstudio-upsell-products > *:first-child:nth-last-child(2)) {
      max-width: 750px;
    }
  
    .hmstudio-upsell-content:has(.hmstudio-upsell-products > *:first-child:nth-last-child(3)) {
      max-width: 1000px;
    }
  
    .hmstudio-upsell-header {
      text-align: center;
      margin-bottom: 30px;
    }
  
    .hmstudio-upsell-title {
      font-size: 28px;
      margin-bottom: 10px;
      color: #333;
    }
  
    .hmstudio-upsell-subtitle {
      font-size: 18px;
      color: #666;
      margin: 0;
    }
  
    .hmstudio-upsell-main {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }
  
    .hmstudio-upsell-sidebar {
      width: 250px;
      flex-shrink: 0;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      position: sticky;
      top: 20px;
    }
  
    .hmstudio-upsell-products {
      display: grid;
      grid-template-columns: repeat(auto-fit, 180px);
      gap: 20px;
      justify-content: center;
      width: 100%;
      margin: 0 auto;
    }
  
    .hmstudio-upsell-product-card {
      border: 1px solid #eee;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2) !important;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
  
    .hmstudio-upsell-product-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  
    .hmstudio-upsell-product-image-container {
      width: 100%;
      margin-bottom: 15px;
    }
  
    .hmstudio-upsell-product-image {
      width: 100%;
      height: 150px;
      object-fit: contain;
      margin-bottom: 10px;
    }
  
    .hmstudio-upsell-product-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  
    .hmstudio-upsell-product-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0;
      min-height: 40px;
      text-align: center;
    }
  
    .hmstudio-upsell-product-price {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--mainColor, #00b286);
      font-weight: bold;
      justify-content: center;
      margin-bottom: 5px;
    }
  
    .hmstudio-upsell-variants {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      margin: 5px 0;
    }
  
    .hmstudio-upsell-variants select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
    }
  
    .hmstudio-upsell-variants label {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
  
    .hmstudio-upsell-product-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 5px;
    }
  
    .hmstudio-upsell-product-quantity {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin: 10px auto;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 2px;
      width: fit-content;
    }
  
    .hmstudio-upsell-quantity-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #666;
      padding: 0;
    }
  
    .hmstudio-upsell-product-quantity input {
      width: 40px;
      border: none;
      text-align: center;
      font-size: 14px;
      padding: 0;
      -moz-appearance: textfield;
      background: transparent;
    }
  
    .hmstudio-upsell-product-quantity input::-webkit-outer-spin-button,
    .hmstudio-upsell-product-quantity input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  
    .addToCartBtn {
      width: 100%;
      padding: 8px 15px;
      background: var(--theme-primary, #00b286);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: opacity 0.3s;
      font-size: 14px;
    }
  
    .addToCartBtn:hover {
      opacity: 0.9;
    }
  
    @media (max-width: 768px) {
      .hmstudio-upsell-content {
        padding: 20px;
        width: 100%;
        height: 100vh;
        border-radius: 0;
        margin: 0;
      }
  
      .hmstudio-upsell-main {
        flex-direction: column;
        gap: 20px;
      }
  
      .hmstudio-upsell-sidebar {
        width: 100%;
        position: static;
        order: 2;
      }
  
      .hmstudio-upsell-products {
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        order: 1;
      }
  
      .hmstudio-upsell-title {
        font-size: 20px;
      }
  
      .hmstudio-upsell-subtitle {
        font-size: 14px;
      }
    }
  
    @media (max-width: 480px) {
      .hmstudio-upsell-content {
        padding: 20px;
        width: 100%;
        height: 100vh;
        border-radius: 15px;
        margin: 10px;
      }
  
      .hmstudio-upsell-products {
        flex-direction: column;
        align-items: center !important;
        display: flex !important;
      }
  
      .hmstudio-upsell-product-card {
        width: 100%;
        display: flex;
        padding: 10px;
      }
  
      .hmstudio-upsell-product-form {
        flex-direction: row;
        align-items: center !important;
        width: 100% !important;
        display: flex;
      }
  
      .hmstudio-upsell-product-image-container {
        width: 100px !important;
        height: 100px !important;
        overflow: unset !important;
        margin-bottom: 0;
        margin-right: 15px;
      }
  
      .hmstudio-upsell-product-image {
        height: 100%;
        margin-bottom: 0;
      }
  
      .hmstudio-upsell-product-content {
        flex: 1;
        gap: 8px;
        text-align: left;
      }
  
      .hmstudio-upsell-product-title {
        min-height: auto;
        font-size: 14px !important;
        text-align: start;
        margin-bottom: 0 !important;
      }
  
      .hmstudio-upsell-product-price {
        justify-content: flex-start !important;
        margin-top: 4px;
      }
  
      .hmstudio-upsell-variants {
        margin: 5px 0;
      }
  
      .hmstudio-upsell-variants select {
        padding: 6px;
        font-size: 12px;
      }
  
      .hmstudio-upsell-variants label {
        font-size: 12px;
        text-align: left;
      }
  
      .hmstudio-upsell-product-controls {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 8px;
      }
  
      .hmstudio-upsell-product-quantity {
        margin: 0;
      }
  
      .addToCartBtn {
        flex: 1;
        max-width: 120px;
        padding: 6px 12px;
        font-size: 12px;
      }
    }
  `;
  
  document.head.appendChild(styleTag);
  
  const UpsellManager = {
    campaigns: [],
    currentModal: null,
    activeTimeout: null,
  
    async fetchCampaigns() {
      try {
        const response = await fetch(`https://europe-west3-hmstudio-85f42.cloudfunctions.net/getUpsellData?storeId=${storeId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.campaigns = data.activeCampaigns || [];
        return this.campaigns;
      } catch (error) {
        return [];
      }
    },
  
      async fetchProductData(productId) {
        const url = `https://europe-west3-hmstudio-85f42.cloudfunctions.net/getProductData?storeId=${storeId}&productId=${productId}`;
        
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch product data: ${response.statusText}`);
          }
          const data = await response.json();
          return data;
        } catch (error) {
          throw error;
        }
      },
  
      async createProductCard(product, currentCampaign) {
        try {
          const fullProductData = await this.fetchProductData(product.id);
      
          if (!fullProductData) {
            throw new Error('Failed to fetch full product data');
          }
      
          const currentLang = getCurrentLanguage();
          const isRTL = currentLang === 'ar';
      
          let productName = fullProductData.name;
          if (typeof productName === 'object') {
            productName = currentLang === 'ar' ? productName.ar : productName.en;
          }
      
          const card = document.createElement('div');
          card.className = 'hmstudio-upsell-product-card';
      
          const form = document.createElement('form');
          form.id = `product-form-${fullProductData.id}`;
          form.className = 'hmstudio-upsell-product-form';
      
          const productIdInput = document.createElement('input');
          productIdInput.type = 'hidden';
          productIdInput.id = 'product-id';
          productIdInput.name = 'product_id';
          productIdInput.value = fullProductData.selected_product?.id || fullProductData.id;
          form.appendChild(productIdInput);
      
          const imageContainer = document.createElement('div');
          imageContainer.className = 'hmstudio-upsell-product-image-container';
      
          const productImage = document.createElement('img');
          productImage.className = 'hmstudio-upsell-product-image';
          productImage.src = fullProductData.images?.[0]?.url || product.thumbnail;
          productImage.alt = productName;
          imageContainer.appendChild(productImage);
      
          const contentContainer = document.createElement('div');
          contentContainer.className = 'hmstudio-upsell-product-content';
      
          const title = document.createElement('h5');
          title.className = 'hmstudio-upsell-product-title';
          title.textContent = productName;
          contentContainer.appendChild(title);
      
          const priceContainer = document.createElement('div');
          priceContainer.className = 'hmstudio-upsell-product-price';
      
          const currentPrice = document.createElement('span');
          const oldPrice = document.createElement('span');
          oldPrice.style.textDecoration = 'line-through';
          oldPrice.style.color = '#999';
          oldPrice.style.fontSize = '0.9em';
      
          const currencySymbol = currentLang === 'ar' ? 'ر.س' : 'SAR';
      
          if (fullProductData.formatted_sale_price) {
            const priceValue = fullProductData.formatted_sale_price.replace(' ر.س', '').replace('SAR', '').trim();
            const oldPriceValue = fullProductData.formatted_price.replace(' ر.س', '').replace('SAR', '').trim();
            
            currentPrice.textContent = isRTL ? `${priceValue} ${currencySymbol}` : `${currencySymbol} ${priceValue}`;
            oldPrice.textContent = isRTL ? `${oldPriceValue} ${currencySymbol}` : `${currencySymbol} ${oldPriceValue}`;
            priceContainer.appendChild(currentPrice);
            priceContainer.appendChild(oldPrice);
          } else {
            const priceValue = fullProductData.formatted_price.replace(' ر.س', '').replace('SAR', '').trim();
            currentPrice.textContent = isRTL ? `${priceValue} ${currencySymbol}` : `${currencySymbol} ${priceValue}`;
            priceContainer.appendChild(currentPrice);
          }
          contentContainer.appendChild(priceContainer);
      
          if (fullProductData.has_options && fullProductData.variants?.length > 0) {
            const variantsSection = this.createVariantsSection(fullProductData, currentLang);
            variantsSection.className = 'hmstudio-upsell-variants';
            contentContainer.appendChild(variantsSection);
          }
      
          const controlsContainer = document.createElement('div');
          controlsContainer.className = 'hmstudio-upsell-product-controls';
      
          const quantityContainer = document.createElement('div');
          quantityContainer.className = 'hmstudio-upsell-product-quantity';
      
          const quantityInput = document.createElement('input');
          quantityInput.type = 'number';
          quantityInput.id = 'product-quantity';
          quantityInput.name = 'quantity';
          quantityInput.min = '1';
          quantityInput.value = '1';
          quantityInput.style.cssText = 'text-align: center; width: 40px; border: none; background: transparent;';
      
          const decreaseBtn = document.createElement('button');
          decreaseBtn.className = 'hmstudio-upsell-quantity-btn';
          decreaseBtn.type = 'button';
          decreaseBtn.textContent = '-';
      
          const increaseBtn = document.createElement('button');
          increaseBtn.className = 'hmstudio-upsell-quantity-btn';
          increaseBtn.type = 'button';
          increaseBtn.textContent = '+';
      
          decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
              quantityInput.value = currentValue - 1;
              const event = new Event('change', { bubbles: true });
              quantityInput.dispatchEvent(event);
            }
          });
      
          increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
            const event = new Event('change', { bubbles: true });
            quantityInput.dispatchEvent(event);
          });
      
          quantityInput.addEventListener('keydown', (e) => {
            e.preventDefault();
          });
      
          quantityContainer.appendChild(decreaseBtn);
          quantityContainer.appendChild(quantityInput);
          quantityContainer.appendChild(increaseBtn);
          controlsContainer.appendChild(quantityContainer);
      
          const addToCartBtn = document.createElement('button');
          addToCartBtn.className = 'addToCartBtn';
          addToCartBtn.type = 'button';
          const originalText = currentLang === 'ar' ? 'إضافة للسلة' : 'Add to Cart';
          const loadingText = currentLang === 'ar' ? 'جاري الإضافة...' : 'Adding...';
          addToCartBtn.textContent = originalText;
  
          addToCartBtn.addEventListener('click', () => {
            try {
              if (fullProductData.has_options && fullProductData.variants?.length > 0) {
                const selects = form.querySelectorAll('.variant-select');
                const missingSelections = [];
                
                selects.forEach(select => {
                  const labelText = select.previousElementSibling.textContent;
                  if (!select.value) {
                    missingSelections.push(labelText);
                  }
                });
  
                if (missingSelections.length > 0) {
                  const message = currentLang === 'ar' 
                    ? `الرجاء اختيار ${missingSelections.join(', ')}`
                    : `Please select ${missingSelections.join(', ')}`;
                  alert(message);
                  return;
                }
              }
  
              const quantityValue = parseInt(quantityInput.value);
              if (isNaN(quantityValue) || quantityValue < 1) {
                const message = currentLang === 'ar' 
                  ? 'الرجاء إدخال كمية صحيحة'
                  : 'Please enter a valid quantity';
                alert(message);
                return;
              }
  
              addToCartBtn.textContent = loadingText;
              addToCartBtn.disabled = true;
              addToCartBtn.style.opacity = '0.7';
  
              let cartPromise;
              if (window.vitrin === true) {
                cartPromise = zid.cart.addProduct({ 
                  product_id: form.querySelector('input[name="product_id"]').value,
                  quantity: parseInt(form.querySelector('#product-quantity').value) || 1
                })
              } else {
                cartPromise = zid.store.cart.addProduct({ 
                  formId: form.id
                })
              }
              cartPromise.then(function(response) {
                if (response.status === 'success') {
                  if (typeof setCartBadge === 'function') {
                    setCartBadge(response.data.cart.products_count);
                  }
              
                  try {
                    const quantityInput = form.querySelector('#product-quantity');
                    const quantity = parseInt(quantityInput.value) || 1;
                    const productId = form.querySelector('input[name="product_id"]').value;
                    const productName = form.querySelector('.hmstudio-upsell-product-title').textContent;
                    const priceElement = form.querySelector('.hmstudio-upsell-product-price');
                    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
                    const price = parseFloat(priceText) || 0;
              
                    console.log('📊 Upsell tracking - cart_add (form submit):', {
                      productId,
                      productName,
                      quantity,
                      price,
                      campaignId: currentCampaign.id,
                      campaignName: currentCampaign.name,
                      vitrin: window.vitrin === true
                    });

                    fetch('https://europe-west3-hmstudio-85f42.cloudfunctions.net/trackUpsellStats', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        storeId,
                        eventType: 'cart_add',
                        productId,
                        productName,
                        quantity,
                        price,
                        campaignId: currentCampaign.id,
                        campaignName: currentCampaign.name,
                        vitrin: window.vitrin === true,
                        timestamp: new Date().toISOString()
                      })
                    }).then(res => {
                      console.log('✅ Upsell cart_add response:', res.status);
                    }).catch(error => {
                      console.error('❌ Upsell cart_add error:', error);
                    });
                  } catch (error) {
                    console.error('❌ Upsell tracking error:', error);
                  }              
                } else {
                  const errorMessage = currentLang === 'ar' 
                    ? response.data.message || 'فشل إضافة المنتج إلى السلة'
                    : response.data.message || 'Failed to add product to cart';
                  alert(errorMessage);
                }
              })
              .catch(function(error) {
              })
              .finally(function() {
                addToCartBtn.textContent = originalText;
                addToCartBtn.disabled = false;
                addToCartBtn.style.opacity = '1';
              });
            } catch (error) {
              addToCartBtn.textContent = originalText;
              addToCartBtn.disabled = false;
              addToCartBtn.style.opacity = '1';
            }
          });
        
          controlsContainer.appendChild(addToCartBtn);
          contentContainer.appendChild(controlsContainer);
      
          form.appendChild(imageContainer);
          form.appendChild(contentContainer);
          card.appendChild(form);
      
          return card;
        } catch (error) {
          return null;
        }
      },
  
      createVariantsSection(product, currentLang) {
        const variantsContainer = document.createElement('div');
        variantsContainer.className = 'hmstudio-upsell-variants';
      
        if (product.variants && product.variants.length > 0) {
          const variantAttributes = new Map();
          
          product.variants.forEach(variant => {
            if (variant.attributes && variant.attributes.length > 0) {
              variant.attributes.forEach(attr => {
                if (!variantAttributes.has(attr.name)) {
                  variantAttributes.set(attr.name, {
                    name: attr.name,
                    slug: attr.slug,
                    values: new Set()
                  });
                }
                variantAttributes.get(attr.name).values.add(attr.value[currentLang]);
              });
            }
          });
      
          variantAttributes.forEach(attr => {
            const select = document.createElement('select');
            select.className = 'variant-select';
            select.style.cssText = `
              margin: 5px 0;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
              width: 100%;
            `;
      
            const labelText = currentLang === 'ar' ? attr.slug : attr.name;
            
            const label = document.createElement('label');
            label.textContent = labelText;
            label.style.cssText = `
              display: block;
              margin-bottom: 5px;
              font-weight: bold;
            `;
      
            const placeholderText = currentLang === 'ar' ? `اختر ${labelText}` : `Select ${labelText}`;
            let optionsHTML = `<option value="">${placeholderText}</option>`;
            
            Array.from(attr.values).forEach(value => {
              optionsHTML += `<option value="${value}">${value}</option>`;
            });
            
            select.innerHTML = optionsHTML;
      
            select.addEventListener('change', () => {
              this.updateSelectedVariant(product, select.closest('form'));
            });
      
            variantsContainer.appendChild(label);
            variantsContainer.appendChild(select);
          });
        }
      
        return variantsContainer;
      },
  
      updateSelectedVariant(product, form) {
        if (!form) {
          return;
        }
      
        const currentLang = getCurrentLanguage();
        const selectedValues = {};
      
        form.querySelectorAll('.variant-select').forEach(select => {
          if (select.value) {
            const labelText = select.previousElementSibling.textContent;
            selectedValues[labelText] = select.value;
          }
        });
      
        const selectedVariant = product.variants.find(variant => {
          return variant.attributes.every(attr => {
            const attrLabel = currentLang === 'ar' ? attr.slug : attr.name;
            return selectedValues[attrLabel] === attr.value[currentLang];
          });
        });
      
        if (selectedVariant) {
          const productIdInput = form.querySelector('input[name="product_id"]');
          if (productIdInput) {
            productIdInput.value = selectedVariant.id;
          }
  
          const priceElement = form.querySelector('.product-price');
          const oldPriceElement = form.querySelector('.product-old-price');
          const currencySymbol = currentLang === 'ar' ? 'ر.س' : 'SAR';
  
          if (priceElement) {
            if (selectedVariant.formatted_sale_price) {
              priceElement.textContent = selectedVariant.formatted_sale_price.replace('SAR', currencySymbol);
              if (oldPriceElement) {
                oldPriceElement.textContent = selectedVariant.formatted_price.replace('SAR', currencySymbol);
                oldPriceElement.style.display = 'inline';
              }
            } else {
              priceElement.textContent = selectedVariant.formatted_price.replace('SAR', currencySymbol);
              if (oldPriceElement) {
                oldPriceElement.style.display = 'none';
              }
            }
          }
  
          const addToCartBtn = form.parentElement.querySelector('.add-to-cart-btn');
          if (addToCartBtn) {
            if (!selectedVariant.unavailable) {
              addToCartBtn.disabled = false;
              addToCartBtn.style.opacity = '1';
              addToCartBtn.style.cursor = 'pointer';
            } else {
              addToCartBtn.disabled = true;
              addToCartBtn.style.opacity = '0.5';
              addToCartBtn.style.cursor = 'not-allowed';
            }
          }
        }
      },
  
      async showUpsellModal(campaign, productCart) {
        if (!campaign?.upsellProducts?.length) {
          return;
        }
        
        try {
          console.log('📊 Upsell tracking - popup_open:', {
            campaignId: campaign.id,
            campaignName: campaign.name,
            vitrin: window.vitrin === true
          });

          await fetch('https://europe-west3-hmstudio-85f42.cloudfunctions.net/trackUpsellStats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storeId,
              eventType: 'popup_open',
              campaignId: campaign.id,
              campaignName: campaign.name,
              vitrin: window.vitrin === true,
              timestamp: new Date().toISOString()
            })
          });
          console.log('✅ Upsell popup_open tracked');
        } catch (error) {
          console.error('❌ Upsell popup_open error:', error);
        }
      
        const currentLang = getCurrentLanguage();
        const isRTL = currentLang === 'ar';
      
        try {
          if (this.currentModal) {
            this.currentModal.remove();
          }
      
          const modal = document.createElement('div');
          modal.className = 'hmstudio-upsell-modal';
          if (isRTL) modal.style.direction = 'rtl';
      
          const content = document.createElement('div');
          content.className = 'hmstudio-upsell-content';
      
          const closeButton = document.createElement('button');
          closeButton.innerHTML = '✕';
          closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            ${isRTL ? 'right' : 'left'}: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 5px;
            line-height: 1;
            z-index: 1;
          `;
          closeButton.addEventListener('click', () => this.closeModal());
      
          const header = document.createElement('div');
          header.className = 'hmstudio-upsell-header';
      
          const title = document.createElement('h2');
          title.className = 'hmstudio-upsell-title';
          title.textContent = currentLang === 'ar' ? 
            decodeURIComponent(campaign.textSettings.titleAr) : 
            campaign.textSettings.titleEn;
      
          const subtitle = document.createElement('p');
          subtitle.className = 'hmstudio-upsell-subtitle';
          subtitle.textContent = currentLang === 'ar' ? 
            decodeURIComponent(campaign.textSettings.subtitleAr) : 
            campaign.textSettings.subtitleEn;
      
          header.appendChild(title);
          header.appendChild(subtitle);
      
          const mainWrapper = document.createElement('div');
          mainWrapper.className = 'hmstudio-upsell-main';
      
          const sidebar = document.createElement('div');
          sidebar.className = 'hmstudio-upsell-sidebar';
      
          const benefitText = document.createElement('div');
          benefitText.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            color: #333;
            font-weight: bold;
          `;
          benefitText.textContent = currentLang === 'ar' ? 'استفد من العرض' : 'Benefit from the Offer';
          sidebar.appendChild(benefitText);
      
          const addAllButton = document.createElement('button');
          addAllButton.textContent = currentLang === 'ar' ? 'أضف الكل إلى السلة' : 'Add All to Cart';
          addAllButton.style.cssText = `
            width: 100%;
            padding: 12px 20px;
            background: #000;
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
          `;
      
          addAllButton.addEventListener('mouseover', () => {
            addAllButton.style.backgroundColor = '#333';
          });
      
          addAllButton.addEventListener('mouseout', () => {
            addAllButton.style.backgroundColor = '#000';
          });
      
          addAllButton.addEventListener('click', async () => {
            const forms = content.querySelectorAll('form');
            const variantForms = Array.from(forms).filter(form => form.querySelector('.variant-select'));
            
            const allVariantsSelected = variantForms.every(form => {
              const selects = form.querySelectorAll('.variant-select');
              return Array.from(selects).every(select => select.value !== '');
            });
          
            if (!allVariantsSelected) {
              const message = currentLang === 'ar' 
                ? 'الرجاء اختيار جميع الخيارات المطلوبة قبل الإضافة إلى السلة'
                : 'Please select all required options before adding to cart';
              alert(message);
              return;
            }
          
            addAllButton.disabled = true;
            addAllButton.style.opacity = '0.7';
            const originalText = addAllButton.textContent;
            addAllButton.textContent = currentLang === 'ar' ? 'جاري الإضافة...' : 'Adding...';
          
            for (const form of forms) {
              await new Promise((resolve) => {
                const productId = form.querySelector('input[name="product_id"]').value;
                const productName = form.querySelector('.hmstudio-upsell-product-title').textContent;
                const quantityInput = form.querySelector('#product-quantity');
                const quantity = parseInt(quantityInput.value) || 1;
                const priceElement = form.querySelector('.hmstudio-upsell-product-price');
                const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
                const price = parseFloat(priceText) || 0;
          
                let cartPromise;
                if (window.vitrin === true) {
                  cartPromise = zid.cart.addProduct({ 
                    product_id: productId,
                    quantity: quantity
                  })
                } else {
                  cartPromise = zid.store.cart.addProduct({ formId: form.id })
                }
                cartPromise.then((response) => {
                    if (response.status === 'success') {
                      if (typeof setCartBadge === 'function') {
                        setCartBadge(response.data.cart.products_count);
                      }
          
                      console.log('📊 Upsell tracking - cart_add (promise):', {
                        productId,
                        productName,
                        quantity,
                        price,
                        campaignId: campaign.id,
                        campaignName: campaign.name,
                        vitrin: window.vitrin === true
                      });

                      fetch('https://europe-west3-hmstudio-85f42.cloudfunctions.net/trackUpsellStats', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          storeId,
                          eventType: 'cart_add',
                          productId,
                          productName,
                          quantity,
                          price,
                          campaignId: campaign.id,
                          campaignName: campaign.name,
                          vitrin: window.vitrin === true,
                          timestamp: new Date().toISOString()
                        })
                      }).then(res => {
                        console.log('✅ Upsell cart_add (promise) response:', res.status);
                      }).catch(error => {
                        console.error('❌ Upsell cart_add (promise) error:', error);
                      });
                    }
                    resolve();
                  })
                  .catch((error) => {
                    resolve();
                  });
              });
            }
          
            modal.remove();
      
            this.closeModal();
          });
      
          sidebar.appendChild(addAllButton);
      
          const productsGrid = document.createElement('div');
          productsGrid.className = 'hmstudio-upsell-products';
      
          const productCards = await Promise.all(
            campaign.upsellProducts.map(product => this.createProductCard(product, campaign))
          );
      
          productCards.filter(Boolean).forEach(card => {
            card.className = 'hmstudio-upsell-product-card';
            productsGrid.appendChild(card);
          });
      
          mainWrapper.appendChild(sidebar);
          mainWrapper.appendChild(productsGrid);
      
          content.appendChild(closeButton);
          content.appendChild(header);
          content.appendChild(mainWrapper);
          modal.appendChild(content);
      
          document.body.appendChild(modal);
          requestAnimationFrame(() => {
            modal.style.opacity = '1';
            content.style.transform = 'translateY(0)';
          });
      
          this.currentModal = modal;
      
          let touchStartY = 0;
          content.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
          });
      
          content.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const diff = touchY - touchStartY;
            
            if (diff > 0 && content.scrollTop === 0) {
              e.preventDefault();
              content.style.transform = `translateY(${diff}px)`;
            }
          });
      
          content.addEventListener('touchend', (e) => {
            const touchY = e.changedTouches[0].clientY;
            const diff = touchY - touchStartY;
            
            if (diff > 100 && content.scrollTop === 0) {
              this.closeModal();
            } else {
              content.style.transform = 'translateY(0)';
            }
          });
      
          modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
          });
      
          const handleEscape = (e) => {
            if (e.key === 'Escape') this.closeModal();
          };
          document.addEventListener('keydown', handleEscape);
      
          modal.addEventListener('remove', () => {
            document.removeEventListener('keydown', handleEscape);
          });
      
        } catch (error) {
        }
      },
  
      closeModal() {
        if (this.currentModal) {
          this.currentModal.style.opacity = '0';
          const content = this.currentModal.querySelector('.hmstudio-upsell-content');
          if (content) {
            content.style.transform = 'translateY(20px)';
          }
          setTimeout(() => {
            if (this.currentModal) {
              this.currentModal.remove();
              this.currentModal = null;
            }
          }, 300);
        }
      },
  
      async initialize() {
        // Fetch campaigns first
        await this.fetchCampaigns();
        
        if (!window.HMStudioUpsell) {
          window.HMStudioUpsell = {
            showUpsellModal: (...args) => {
              return this.showUpsellModal.apply(this, args);
            },
            closeModal: () => this.closeModal()
          };
        }
      
        // IMPROVED: Only close on unload, not on visibility change
        window.addEventListener('beforeunload', () => {
          if (this.currentModal) {
            this.closeModal();
          }
        });
      
        window.addEventListener('resize', () => {
          if (this.currentModal) {
            const content = this.currentModal.querySelector('.hmstudio-upsell-content');
            if (content) {
              content.style.maxHeight = `${window.innerHeight * 0.9}px`;
            }
          }
        });
    
        window.addEventListener('beforeunload', () => {
          if (this.currentModal) {
            this.closeModal();
          }
        });
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        await UpsellManager.initialize();
      });
    } else {
      UpsellManager.initialize();
    }
  }
})();
