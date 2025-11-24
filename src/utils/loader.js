let activeRequests = 0
let loaderElement = null

function ensureLoader() {
  if (loaderElement) return
  
  loaderElement = document.createElement('div')
  loaderElement.id = 'global-loader'
  loaderElement.innerHTML = `
    <div class="loader-backdrop">
      <div class="loader-spinner"></div>
    </div>
  `
  
  const style = document.createElement('style')
  style.textContent = `
    #global-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: none;
    }
    
    #global-loader.active {
      display: block;
    }
    
    .loader-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: grid;
      place-items: center;
    }
    
    .loader-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
  
  document.head.appendChild(style)
  document.body.appendChild(loaderElement)
}

export const loader = {
  start() {
    ensureLoader()
    activeRequests++
    if (activeRequests === 1) {
      loaderElement?.classList.add('active')
    }
  },
  
  stop() {
    ensureLoader()
    activeRequests = Math.max(0, activeRequests - 1)
    if (activeRequests === 0) {
      loaderElement?.classList.remove('active')
    }
  },
  
  reset() {
    activeRequests = 0
    loaderElement?.classList.remove('active')
  }
}