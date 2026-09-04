let s=!0;chrome.storage.local.get(["floatingBubbleEnabled"],e=>{s=e.floatingBubbleEnabled!==!1});chrome.storage.onChanged.addListener((e,n)=>{n==="local"&&e.floatingBubbleEnabled&&(s=e.floatingBubbleEnabled.newValue!==!1,s||o())});const c=`
	.nostalgia-bubble {
		all: initial;
		position: fixed;
		display: none;
		align-items: center;
		gap: 6px;
		top: 0;
		left: 0;
		padding: 6px 12px;
		background: #2d2d2d;
		color: #fdfbf7;
		border: none;
		border-radius: 8px;
		font: 600 12.5px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
		opacity: 0;
		pointer-events: none;
		transform: translateY(4px);
		transition: opacity 0.12s ease, transform 0.12s ease;
	}
	.nostalgia-bubble.visible {
		display: flex;
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}
	.nostalgia-bubble:hover {
		background: #ff4d4d;
	}
`;let a=null,t=null,d="",l;function b(){if(a)return;a=document.createElement("div"),a.style.cssText="all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 2147483647; pointer-events: none;";const e=a.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=c,e.appendChild(n),t=document.createElement("button"),t.type="button",t.className="nostalgia-bubble",t.textContent="💾 Save to Nostalgia",t.addEventListener("mousedown",i=>i.preventDefault()),t.addEventListener("click",p),e.appendChild(t),document.documentElement.appendChild(a)}function f(e,n){if(!s||(b(),!t))return;d=n,t.textContent="💾 Save to Nostalgia";const i=Math.max(8,e.top-40),u=Math.min(Math.max(8,e.right-90),window.innerWidth-190);t.style.top=`${i}px`,t.style.left=`${u}px`,t.classList.add("visible")}function o(){t==null||t.classList.remove("visible")}function p(){!d||!t||(t.textContent="Saved ✓",chrome.runtime.sendMessage({type:"nostalgia-save-text",text:d},()=>{l&&clearTimeout(l),l=window.setTimeout(o,500)}))}function r(){if(!s)return;const e=window.getSelection(),n=e?e.toString().trim():"";if(!e||!n||e.rangeCount===0){o();return}const i=e.getRangeAt(0).getBoundingClientRect();if(i.width===0&&i.height===0){o();return}f(i,n)}document.addEventListener("mouseup",()=>window.setTimeout(r,0));document.addEventListener("keyup",e=>{(e.shiftKey||e.key.startsWith("Arrow"))&&window.setTimeout(r,0)});document.addEventListener("mousedown",e=>{a&&!a.contains(e.target)&&o()});document.addEventListener("scroll",o,!0);window.addEventListener("resize",o);document.addEventListener("keydown",e=>{e.key==="Escape"&&o()});
