// Pacific Sands - Main JavaScript
(function() {
  'use strict';

  // DOM Content Loaded
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initScrollAnimations();
    initLotsTable();
    initGallery();
    initAccordions();
    initSmoothScroll();
  });

  // Mobile Menu Toggle
  function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        const isActive = navLinks.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', isActive);
        mobileToggle.innerHTML = isActive ? '✕' : '☰';
      });

      // Close menu when clicking on links
      navLinks.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.innerHTML = '☰';
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.innerHTML = '☰';
        }
      });
    }
  }

  // Scroll Animations
  function initScrollAnimations() {
    if (window.IntersectionObserver) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      // Observe all fade-in elements
      document.querySelectorAll('.fade-in').forEach(function(element) {
        observer.observe(element);
      });
    }
  }

  // Lots Table Functionality
  function initLotsTable() {
    const tableContainer = document.querySelector('.lots-table-container');
    if (!tableContainer) return;

    let lotsData = [];
    let filteredData = [];

    // Load lots data
    fetch('/data/lots.json')
      .then(response => response.json())
      .then(data => {
        lotsData = data;
        filteredData = [...data];
        renderTable();
        setupFilters();
      })
      .catch(error => {
        console.error('Error loading lots data:', error);
        showError('Unable to load lots data. Please refresh the page.');
      });

    function renderTable() {
      const tableBody = document.querySelector('.lots-table tbody');
      if (!tableBody) return;

      tableBody.innerHTML = '';

      if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No lots match your criteria</td></tr>';
        return;
      }

      filteredData.forEach(function(lot) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${lot.lot_number}</td>
          <td>${lot.type}</td>
          <td>${lot.area_m2.toLocaleString()} m²</td>
          <td>${lot.frontage_m} m</td>
          <td><span class="status-badge status-${lot.status.toLowerCase()}">${lot.status}</span></td>
          <td>${lot.view}</td>
          <td>${lot.elevation_m} m</td>
        `;
        tableBody.appendChild(row);
      });
    }

    function setupFilters() {
      const statusFilter = document.querySelector('#status-filter');
      const viewFilter = document.querySelector('#view-filter');
      const typeFilter = document.querySelector('#type-filter');
      const minAreaFilter = document.querySelector('#min-area');
      const maxAreaFilter = document.querySelector('#max-area');
      const sortSelect = document.querySelector('#sort-by');
      const exportBtn = document.querySelector('#export-csv');

      // Filter change handlers
      [statusFilter, viewFilter, typeFilter, minAreaFilter, maxAreaFilter, sortSelect].forEach(function(filter) {
        if (filter) {
          filter.addEventListener('change', applyFilters);
        }
      });

      // Export CSV
      if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
      }

      function applyFilters() {
        const status = statusFilter ? statusFilter.value : '';
        const view = viewFilter ? viewFilter.value : '';
        const type = typeFilter ? typeFilter.value : '';
        const minArea = minAreaFilter ? parseInt(minAreaFilter.value) || 0 : 0;
        const maxArea = maxAreaFilter ? parseInt(maxAreaFilter.value) || Infinity : Infinity;
        const sortBy = sortSelect ? sortSelect.value : 'lot_number';

        filteredData = lotsData.filter(function(lot) {
          return (!status || lot.status === status) &&
                 (!view || lot.view === view) &&
                 (!type || lot.type === type) &&
                 lot.area_m2 >= minArea && lot.area_m2 <= maxArea;
        });

        // Sort data
        filteredData.sort(function(a, b) {
          switch (sortBy) {
            case 'area_asc':
              return a.area_m2 - b.area_m2;
            case 'area_desc':
              return b.area_m2 - a.area_m2;
            case 'type':
              return a.type.localeCompare(b.type);
            case 'lot_number':
            default:
              return a.lot_number.localeCompare(b.lot_number);
          }
        });

        renderTable();
      }
    }

    function exportToCSV() {
      if (filteredData.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = ['Lot Number', 'Type', 'Area (m²)', 'Frontage (m)', 'Status', 'View', 'Elevation (m)'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map(lot => [
          lot.lot_number,
          lot.type,
          lot.area_m2,
          lot.frontage_m,
          lot.status,
          lot.view,
          lot.elevation_m
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'pacific-sands-lots.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function showError(message) {
      const tableBody = document.querySelector('.lots-table tbody');
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #dc2626;">${message}</td></tr>`;
      }
    }
  }

  // Gallery Lightbox
  function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    galleryItems.forEach(function(item) {
      item.addEventListener('click', function() {
        const img = item.querySelector('img');
        if (img) {
          openLightbox(img.src, img.alt);
        }
      });
    });

    function openLightbox(src, alt) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
      `;

      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
      `;

      lightbox.appendChild(img);
      document.body.appendChild(lightbox);
      document.body.style.overflow = 'hidden';

      lightbox.addEventListener('click', function() {
        document.body.removeChild(lightbox);
        document.body.style.overflow = '';
      });

      // Close on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (document.body.contains(lightbox)) {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
          }
        }
      });
    }
  }

  // Accordion Functionality
  function initAccordions() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(function(item) {
      const header = item.querySelector('.accordion-header');
      if (header) {
        header.addEventListener('click', function() {
          const isActive = item.classList.contains('active');
          
          // Close all other accordion items
          accordionItems.forEach(function(otherItem) {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle current item
          item.classList.toggle('active', !isActive);
        });
      }
    });
  }

  // Smooth Scroll
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - headerHeight - 20;
          
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, targetPosition);
          } else {
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  // Form Validation
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(function(field) {
          if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc2626';
            field.focus();
          } else {
            field.style.borderColor = '';
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          alert('Please fill in all required fields.');
        }
      });
    });
  }

  // Initialize form validation
  initFormValidation();

  // Utility Functions
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Header scroll effect
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    
    const updateHeader = throttle(function() {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
      }
      
      lastScrollY = currentScrollY;
    }, 100);

    window.addEventListener('scroll', updateHeader);
  }

  // Initialize header scroll effect
  initHeaderScroll();

  // Lazy loading for images
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(function(img) {
        imageObserver.observe(img);
      });
    }
  }

  // Initialize lazy loading
  initLazyLoading();

})();
