// i want to create a header ui that will be used in the web client, I dont want to use angular or react, I want to use vanilla js and html, start by creating the html and css for the header
// shared/components/header.ts
class Header extends HTMLElement {
    private shadow: ShadowRoot;
  
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['left', 'center', 'right'];
    }
  
    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
      this.render();
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
      const left = this.getAttribute('left') || 'My Mate';
      const center = this.getAttribute('center') || 'Phase 2';
      const right = this.getAttribute('right') || 'Profile';
  
      this.shadow.innerHTML = `
        <style>
          .header {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            background: #000;
            color: #000;
            font-family: sans-serif;
            font-weight: bold;
            text-align: center;
          }
          .box {
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .left {
            background: #f8c0c0;
          }
          .center {
            background: #fff;
          }
          .right {
            background: #c0f8f8;
          }
        </style>
        <div class="header">
          <div class="box left">${left}</div>
          <div class="box center">${center}</div>
          <div class="box right">${right}</div>
        </div>
      `;
    }
  }
  
  customElements.define('header', Header);