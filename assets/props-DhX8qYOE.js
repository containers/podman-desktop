const Lr="5.0.0-next.265",Rn="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Rn);const Mr=1,qr=2,Fr=4,jr=8,kr=16,Ln=1,Mn=2,Ge=4,qn=8,Fn=16,Ze=1,jn=2,b=Symbol(),ze=!1;var Xe=Array.isArray,kn=Array.from,Bn=Object.defineProperty,k=Object.getOwnPropertyDescriptor,Vn=Object.getOwnPropertyDescriptors,Hn=Object.prototype,Un=Array.prototype,Je=Object.getPrototypeOf;function _e(e){return typeof e=="function"}const Br=()=>{};function Kn(e){return e()}function be(e){for(var n=0;n<e.length;n++)e[n]()}function Vr(e,n,r=!1){return e===void 0?r?n():n:e}const C=2,Qe=4,Q=8,en=16,D=32,ae=64,V=128,de=256,g=512,M=1024,ee=2048,z=4096,fe=8192,$n=16384,Pe=32768,nn=65536,Yn=1<<18,rn=1<<19,B=Symbol("$state"),Hr=Symbol("");function tn(e){return e===this.v}function Wn(e,n){return e!=e?n==n:e!==n||e!==null&&typeof e=="object"||typeof e=="function"}function Ce(e){return!Wn(e,this.v)}function Gn(e){throw new Error("effect_in_teardown")}function Zn(){throw new Error("effect_in_unowned_derived")}function zn(e){throw new Error("effect_orphan")}function Xn(){throw new Error("effect_update_depth_exceeded")}function Ur(e){throw new Error("lifecycle_legacy_only")}function Jn(e){throw new Error("props_invalid_value")}function Qn(){throw new Error("state_descriptors_fixed")}function er(){throw new Error("state_prototype_fixed")}function nr(){throw new Error("state_unsafe_local_read")}function rr(){throw new Error("state_unsafe_mutation")}function A(e){return{f:0,v:e,reactions:null,equals:tn,version:0}}function Kr(e){return ln(A(e))}function un(e,n=!1){var t;const r=A(e);return n||(r.equals=Ce),p!==null&&p.l!==null&&((t=p.l).s??(t.s=[])).push(r),r}function $r(e,n=!1){return ln(un(e,n))}function ln(e){return h!==null&&h.f&C&&(P===null?vr([e]):P.push(e)),e}function Fe(e,n){return O(e,ce(()=>m(e))),n}function O(e,n){return h!==null&&Se()&&h.f&C&&(P===null||!P.includes(e))&&rr(),e.equals(n)||(e.v=n,e.version=gn(),sn(e,M),Se()&&d!==null&&d.f&g&&!(d.f&D)&&(y!==null&&y.includes(e)?(I(d,M),Ee(d)):L===null?dr([e]):L.push(e))),n}function sn(e,n){var r=e.reactions;if(r!==null)for(var t=Se(),u=r.length,i=0;i<u;i++){var s=r[i],c=s.f;c&M||!t&&s===d||(I(s,n),c&(g|V)&&(c&C?sn(s,ee):Ee(s)))}}function an(e){d===null&&h===null&&zn(),h!==null&&h.f&V&&Zn(),Ne&&Gn()}function tr(e,n){var r=n.last;r===null?n.last=n.first=e:(r.next=e,e.prev=r,n.last=e)}function ne(e,n,r,t=!0){var u=(e&ae)!==0,i=d,s={ctx:p,deps:null,deriveds:null,nodes_start:null,nodes_end:null,f:e|M,first:null,fn:n,last:null,next:null,parent:u?null:i,prev:null,teardown:null,transitions:null,version:0};if(r){var c=G;try{Be(!0),oe(s),s.f|=$n}catch(a){throw re(s),a}finally{Be(c)}}else n!==null&&Ee(s);var f=r&&s.deps===null&&s.first===null&&s.nodes_start===null&&s.teardown===null&&(s.f&rn)===0;if(!f&&!u&&t&&(i!==null&&tr(s,i),h!==null&&h.f&C)){var l=h;(l.children??(l.children=[])).push(s)}return s}function ur(e){const n=ne(Q,null,!1);return I(n,g),n.teardown=e,n}function je(e){an();var n=d!==null&&(d.f&Q)!==0&&p!==null&&!p.m;if(n){var r=p;(r.e??(r.e=[])).push({fn:e,effect:d,reaction:h})}else{var t=fn(e);return t}}function ir(e){return an(),me(e)}function lr(e){const n=ne(ae,e,!0);return()=>{re(n)}}function fn(e){return ne(Qe,e,!1)}function Yr(e,n){var r=p,t={effect:null,ran:!1};r.l.r1.push(t),t.effect=me(()=>{e(),!t.ran&&(t.ran=!0,O(r.l.r2,!0),ce(n))})}function Wr(){var e=p;me(()=>{if(m(e.l.r2)){for(var n of e.l.r1){var r=n.effect;r.f&g&&I(r,ee),te(r)&&oe(r),n.ran=!1}e.l.r2.v=!1}})}function me(e){return ne(Q,e,!0)}function Gr(e){return me(e)}function on(e,n=0){return ne(Q|en|n,e,!0)}function pe(e,n=!0){return ne(Q|D,e,!0,n)}function cn(e){var n=e.teardown;if(n!==null){const r=Ne,t=h;Ve(!0),ye(null);try{n.call(null)}finally{Ve(r),ye(t)}}}function re(e,n=!0){var r=!1;if((n||e.f&Yn)&&e.nodes_start!==null){for(var t=e.nodes_start,u=e.nodes_end;t!==null;){var i=t===u?null:Me(t);t.remove(),t=i}r=!0}xn(e,n&&!r),se(e,0),I(e,fe);var s=e.transitions;if(s!==null)for(const f of s)f.stop();cn(e);var c=e.parent;c!==null&&c.first!==null&&_n(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.parent=e.fn=e.nodes_start=e.nodes_end=null}function _n(e){var n=e.parent,r=e.prev,t=e.next;r!==null&&(r.next=t),t!==null&&(t.prev=r),n!==null&&(n.first===e&&(n.first=t),n.last===e&&(n.last=r))}function xe(e,n){var r=[];vn(e,r,!0),sr(r,()=>{re(e),n&&n()})}function sr(e,n){var r=e.length;if(r>0){var t=()=>--r||n();for(var u of e)u.out(t)}else n()}function vn(e,n,r){if(!(e.f&z)){if(e.f^=z,e.transitions!==null)for(const s of e.transitions)(s.is_global||r)&&n.push(s);for(var t=e.first;t!==null;){var u=t.next,i=(t.f&Pe)!==0||(t.f&D)!==0;vn(t,n,i?r:!1),t=u}}}function ke(e){dn(e,!0)}function dn(e,n){if(e.f&z){e.f^=z,te(e)&&oe(e);for(var r=e.first;r!==null;){var t=r.next,u=(r.f&Pe)!==0||(r.f&D)!==0;dn(r,u?n:!1),r=t}if(e.transitions!==null)for(const i of e.transitions)(i.is_global||n)&&i.in()}}let he=!1,Te=[];function pn(){he=!1;const e=Te.slice();Te=[],be(e)}function ar(e){he||(he=!0,queueMicrotask(pn)),Te.push(e)}function fr(){he&&pn()}function we(e){let n=C|M;d===null?n|=V:d.f|=rn;const r={children:null,deps:null,equals:tn,f:n,fn:e,reactions:null,v:null,version:0,parent:d};if(h!==null&&h.f&C){var t=h;(t.children??(t.children=[])).push(r)}return d!==null&&(d.deriveds??(d.deriveds=[])).push(r),r}function or(e){const n=we(e);return n.equals=Ce,n}function hn(e){var n=e.children;if(n!==null){e.children=null;for(var r=0;r<n.length;r+=1){var t=n[r];t.f&C?De(t):re(t)}}}function wn(e){var n,r=d;X(e.parent);try{hn(e),n=bn(e)}finally{X(r)}return n}function yn(e){var n=wn(e),r=(Y||e.f&V)&&e.deps!==null?ee:g;I(e,r),e.equals(n)||(e.v=n,e.version=gn())}function De(e){hn(e),se(e,0),I(e,fe),e.v=e.children=e.deps=e.reactions=null}function cr(e){throw new Error("lifecycle_outside_component")}const mn=0,_r=1;let ve=mn,le=!1,G=!1,Ne=!1;function Be(e){G=e}function Ve(e){Ne=e}let j=[],Z=0;let h=null;function ye(e){h=e}let d=null;function X(e){d=e}let P=null;function vr(e){P=e}let y=null,x=0,L=null;function dr(e){L=e}let En=0,Y=!1,W=!1,K=new Set,p=null;function gn(){return++En}function Se(){return p!==null&&p.l===null}function te(e){var s,c;var n=e.f;if(n&M)return!0;if(n&ee){var r=e.deps,t=(n&V)!==0;if(r!==null){var u;if(n&de){for(u=0;u<r.length;u++)((s=r[u]).reactions??(s.reactions=[])).push(e);e.f^=de}for(u=0;u<r.length;u++){var i=r[u];if(te(i)&&yn(i),t&&d!==null&&!Y&&!((c=i==null?void 0:i.reactions)!=null&&c.includes(e))&&(i.reactions??(i.reactions=[])).push(e),i.version>e.version)return!0}}t||I(e,g)}return!1}function pr(e,n,r){throw e}function bn(e){var o;var n=y,r=x,t=L,u=h,i=Y,s=P,c=e.f;y=null,x=0,L=null,h=c&(D|ae)?null:e,Y=!G&&(c&V)!==0,P=null;try{var f=(0,e.fn)(),l=e.deps;if(y!==null){var a;if(se(e,x),l!==null&&x>0)for(l.length=x+y.length,a=0;a<y.length;a++)l[x+a]=y[a];else e.deps=l=y;if(!Y)for(a=x;a<l.length;a++)((o=l[a]).reactions??(o.reactions=[])).push(e)}else l!==null&&x<l.length&&(se(e,x),l.length=x);return f}finally{y=n,x=r,L=t,h=u,Y=i,P=s}}function hr(e,n){let r=n.reactions;if(r!==null){var t=r.indexOf(e);if(t!==-1){var u=r.length-1;u===0?r=n.reactions=null:(r[t]=r[u],r.pop())}}r===null&&n.f&C&&(y===null||!y.includes(n))&&(I(n,ee),n.f&(V|de)||(n.f^=de),se(n,0))}function se(e,n){var r=e.deps;if(r!==null)for(var t=n;t<r.length;t++)hr(e,r[t])}function xn(e,n=!1){var r=e.deriveds;if(r!==null){e.deriveds=null;for(var t=0;t<r.length;t+=1)De(r[t])}var u=e.first;for(e.first=e.last=null;u!==null;){var i=u.next;re(u,n),u=i}}function wr(e){for(var n=e.first;n!==null;){var r=n.next;n.f&D||re(n),n=r}}function oe(e){var n=e.f;if(!(n&fe)){I(e,g);var r=d,t=p;d=e,p=e.ctx;try{n&en?wr(e):xn(e),cn(e);var u=bn(e);e.teardown=typeof u=="function"?u:null,e.version=En}catch(i){pr(i)}finally{d=r,p=t}}}function Tn(){Z>1e3&&(Z=0,Xn()),Z++}function Sn(e){var n=e.length;if(n!==0){Tn();var r=G;G=!0;try{for(var t=0;t<n;t++){var u=e[t];u.f&g||(u.f^=g);var i=[];An(u,i),yr(i)}}finally{G=r}}}function yr(e){var n=e.length;if(n!==0)for(var r=0;r<n;r++){var t=e[r];!(t.f&(fe|z))&&te(t)&&(oe(t),t.deps===null&&t.first===null&&t.nodes_start===null&&(t.teardown===null?_n(t):t.fn=null))}}function mr(){if(le=!1,Z>1001)return;const e=j;j=[],Sn(e),le||(Z=0)}function Ee(e){ve===mn&&(le||(le=!0,queueMicrotask(mr)));for(var n=e;n.parent!==null;){n=n.parent;var r=n.f;if(r&(ae|D)){if(!(r&g))return;n.f^=g}}j.push(n)}function An(e,n){var r=e.first,t=[];e:for(;r!==null;){var u=r.f,i=(u&D)!==0,s=i&&(u&g)!==0;if(!s&&!(u&z))if(u&Q){i?r.f^=g:te(r)&&oe(r);var c=r.first;if(c!==null){r=c;continue}}else u&Qe&&t.push(r);var f=r.next;if(f===null){let o=r.parent;for(;o!==null;){if(e===o)break e;var l=o.next;if(l!==null){r=l;continue e}o=o.parent}}r=f}for(var a=0;a<t.length;a++)c=t[a],n.push(c),An(c,n)}function On(e){var n=ve,r=j;try{Tn();const u=[];ve=_r,j=u,le=!1,Sn(r);var t=e==null?void 0:e();return fr(),(j.length>0||u.length>0)&&On(),Z=0,t}finally{ve=n,j=r}}async function Zr(){await Promise.resolve(),On()}function m(e){var n=e.f,r=(n&C)!==0;if(r&&n&fe){var t=wn(e);return De(e),t}if(W&&K.add(e),h!==null){P!==null&&P.includes(e)&&nr();var u=h.deps;y===null&&u!==null&&u[x]===e?x++:y===null?y=[e]:y.push(e),L!==null&&d!==null&&d.f&g&&!(d.f&D)&&L.includes(e)&&(I(d,M),Ee(d))}if(r){var i=e;te(i)&&yn(i)}return e.v}function zr(e){var n=W,r=K;W=!0,K=new Set;var t=K,u;try{ce(e)}finally{if(W=n,W)for(u of K)r.add(u);K=r}for(u of t)if(u.f&nn)for(const i of u.deps||[])i.f&C||Fe(i,null);else Fe(u,null)}function ce(e){const n=h;try{return h=null,e()}finally{h=n}}const Er=~(M|ee|g);function I(e,n){e.f=e.f&Er|n}function Xr(e){return Re().get(e)}function Jr(e,n){return Re().set(e,n),n}function Qr(e){return Re().has(e)}function Re(e){return p===null&&cr(),p.c??(p.c=new Map(gr(p)||void 0))}function gr(e){let n=e.p;for(;n!==null;){const r=n.c;if(r!==null)return r;n=n.p}return null}function He(e,n=1){var r=+m(e);return O(e,r+n),r}function et(e,n){var r={};for(var t in e)n.includes(t)||(r[t]=e[t]);return r}function br(e,n=!1,r){p={p,c:null,e:null,m:!1,s:e,x:null,l:null},n||(p.l={s:null,u:null,r1:[],r2:A(!1)})}function xr(e){const n=p;if(n!==null){e!==void 0&&(n.x=e);const s=n.e;if(s!==null){var r=d,t=h;n.e=null;try{for(var u=0;u<s.length;u++){var i=s[u];X(i.effect),ye(i.reaction),fn(i.fn)}}finally{X(r),ye(t)}}p=n.p,n.m=!0}return e||{}}function Tr(e){if(!(typeof e!="object"||!e||e instanceof EventTarget)){if(B in e)Ae(e);else if(!Array.isArray(e))for(let n in e){const r=e[n];typeof r=="object"&&r&&B in r&&Ae(r)}}}function Ae(e,n=new Set){if(typeof e=="object"&&e!==null&&!(e instanceof EventTarget)&&!n.has(e)){n.add(e),e instanceof Date&&e.getTime();for(let t in e)try{Ae(e[t],n)}catch{}const r=Je(e);if(r!==Object.prototype&&r!==Array.prototype&&r!==Map.prototype&&r!==Set.prototype&&r!==Date.prototype){const t=Vn(r);for(let u in t){const i=t[u].get;if(i)try{i.call(e)}catch{}}}}}function $(e,n=null,r){if(typeof e!="object"||e===null||B in e)return e;const t=Je(e);if(t!==Hn&&t!==Un)return e;var u=new Map,i=Xe(e),s=A(0);i&&u.set("length",A(e.length));var c;return new Proxy(e,{defineProperty(f,l,a){(!("value"in a)||a.configurable===!1||a.enumerable===!1||a.writable===!1)&&Qn();var o=u.get(l);return o===void 0?(o=A(a.value),u.set(l,o)):O(o,$(a.value,c)),!0},deleteProperty(f,l){var a=u.get(l);if(a===void 0)l in f&&u.set(l,A(b));else{if(i&&typeof l=="string"){var o=u.get("length"),_=Number(l);Number.isInteger(_)&&_<o.v&&O(o,_)}O(a,b),Ue(s)}return!0},get(f,l,a){var w;if(l===B)return e;var o=u.get(l),_=l in f;if(o===void 0&&(!_||(w=k(f,l))!=null&&w.writable)&&(o=A($(_?f[l]:b,c)),u.set(l,o)),o!==void 0){var v=m(o);return v===b?void 0:v}return Reflect.get(f,l,a)},getOwnPropertyDescriptor(f,l){var a=Reflect.getOwnPropertyDescriptor(f,l);if(a&&"value"in a){var o=u.get(l);o&&(a.value=m(o))}else if(a===void 0){var _=u.get(l),v=_==null?void 0:_.v;if(_!==void 0&&v!==b)return{enumerable:!0,configurable:!0,value:v,writable:!0}}return a},has(f,l){var v;if(l===B)return!0;var a=u.get(l),o=a!==void 0&&a.v!==b||Reflect.has(f,l);if(a!==void 0||d!==null&&(!o||(v=k(f,l))!=null&&v.writable)){a===void 0&&(a=A(o?$(f[l],c):b),u.set(l,a));var _=m(a);if(_===b)return!1}return o},set(f,l,a,o){var F;var _=u.get(l),v=l in f;if(i&&l==="length")for(var w=a;w<_.v;w+=1){var T=u.get(w+"");T!==void 0?O(T,b):w in f&&(T=A(b),u.set(w+"",T))}_===void 0?(!v||(F=k(f,l))!=null&&F.writable)&&(_=A(void 0),O(_,$(a,c)),u.set(l,_)):(v=_.v!==b,O(_,$(a,c)));var N=Reflect.getOwnPropertyDescriptor(f,l);if(N!=null&&N.set&&N.set.call(o,a),!v){if(i&&typeof l=="string"){var S=u.get("length"),q=Number(l);Number.isInteger(q)&&q>=S.v&&O(S,q+1)}Ue(s)}return!0},ownKeys(f){m(s);var l=Reflect.ownKeys(f).filter(_=>{var v=u.get(_);return v===void 0||v.v!==b});for(var[a,o]of u)o.v!==b&&!(a in f)&&l.push(a);return l},setPrototypeOf(){er()}})}function Ue(e,n=1){O(e,e.v+n)}function Ke(e){return e!==null&&typeof e=="object"&&B in e?e[B]:e}function nt(e,n){return Object.is(Ke(e),Ke(n))}var $e,In,Pn;function Sr(){if($e===void 0){$e=window;var e=Element.prototype,n=Node.prototype;In=k(n,"firstChild").get,Pn=k(n,"nextSibling").get,e.__click=void 0,e.__className="",e.__attributes=null,e.__e=void 0,Text.prototype.__t=void 0}}function Le(e=""){return document.createTextNode(e)}function R(e){return In.call(e)}function Me(e){return Pn.call(e)}function rt(e){return R(e)}function tt(e,n){{var r=R(e);return r instanceof Comment&&r.data===""?Me(r):r}}function ut(e,n=1,r=!1){let t=e;for(;n--;)t=Me(t);return t}function it(e){e.textContent=""}const Cn=new Set,Oe=new Set;function Ar(e,n,r,t){function u(i){if(t.capture||ie.call(n,i),!i.cancelBubble)return r.call(this,i)}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?ar(()=>{n.addEventListener(e,u,t)}):n.addEventListener(e,u,t),u}function lt(e,n,r,t,u){var i={capture:t,passive:u},s=Ar(e,n,r,i);(n===document.body||n===window||n===document)&&ur(()=>{n.removeEventListener(e,s,i)})}function st(e){for(var n=0;n<e.length;n++)Cn.add(e[n]);for(var r of Oe)r(e)}function ie(e){var N;var n=this,r=n.ownerDocument,t=e.type,u=((N=e.composedPath)==null?void 0:N.call(e))||[],i=u[0]||e.target,s=0,c=e.__root;if(c){var f=u.indexOf(c);if(f!==-1&&(n===document||n===window)){e.__root=n;return}var l=u.indexOf(n);if(l===-1)return;f<=l&&(s=f)}if(i=u[s]||e.target,i!==n){Bn(e,"currentTarget",{configurable:!0,get(){return i||r}});try{for(var a,o=[];i!==null;){var _=i.assignedSlot||i.parentNode||i.host||null;try{var v=i["__"+t];if(v!==void 0&&!i.disabled)if(Xe(v)){var[w,...T]=v;w.apply(i,[e,...T])}else v.call(i,e)}catch(S){a?o.push(S):a=S}if(e.cancelBubble||_===n||_===null)break;i=_}if(a){for(let S of o)queueMicrotask(()=>{throw S});throw a}}finally{e.__root=n,delete e.currentTarget}}}function Dn(e){var n=document.createElement("template");return n.innerHTML=e,n.content}function J(e,n){var r=d;r.nodes_start===null&&(r.nodes_start=e,r.nodes_end=n)}function at(e,n){var r=(n&Ze)!==0,t=(n&jn)!==0,u,i=!e.startsWith("<!>");return()=>{u===void 0&&(u=Dn(i?e:"<!>"+e),r||(u=R(u)));var s=t?document.importNode(u,!0):u.cloneNode(!0);if(r){var c=R(s),f=s.lastChild;J(c,f)}else J(s,s);return s}}function ft(e,n,r="svg"){var t=!e.startsWith("<!>"),u=(n&Ze)!==0,i=`<${r}>${t?e:"<!>"+e}</${r}>`,s;return()=>{if(!s){var c=Dn(i),f=R(c);if(u)for(s=document.createDocumentFragment();R(f);)s.appendChild(R(f));else s=R(f)}var l=s.cloneNode(!0);if(u){var a=R(l),o=l.lastChild;J(a,o)}else J(l,l);return l}}function ot(e=""){{var n=Le(e+"");return J(n,n),n}}function ct(){var e=document.createDocumentFragment(),n=document.createComment(""),r=Le();return e.append(n,r),J(n,r),e}function _t(e,n){e!==null&&e.before(n)}const Or=["touchstart","touchmove"];function Ir(e){return Or.includes(e)}function vt(e,n){var r=n==null?"":typeof n=="object"?n+"":n;r!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=r,e.nodeValue=r==null?"":r+"")}function dt(e,n){return Pr(e,n)}const U=new Map;function Pr(e,{target:n,anchor:r,props:t={},events:u,context:i,intro:s=!0}){Sr();var c=new Set,f=o=>{for(var _=0;_<o.length;_++){var v=o[_];if(!c.has(v)){c.add(v);var w=Ir(v);n.addEventListener(v,ie,{passive:w});var T=U.get(v);T===void 0?(document.addEventListener(v,ie,{passive:w}),U.set(v,1)):U.set(v,T+1)}}};f(kn(Cn)),Oe.add(f);var l=void 0,a=lr(()=>{var o=r??n.appendChild(Le());return pe(()=>{if(i){br({});var _=p;_.c=i}u&&(t.$$events=u),l=e(o,t)||{},i&&xr()}),()=>{var w;for(var _ of c){n.removeEventListener(_,ie);var v=U.get(_);--v===0?(document.removeEventListener(_,ie),U.delete(_)):U.set(_,v)}Oe.delete(f),Ie.delete(l),o!==r&&((w=o.parentNode)==null||w.removeChild(o))}});return Ie.set(l,a),l}let Ie=new WeakMap;function pt(e){const n=Ie.get(e);n&&n()}function ht(e,n,r,t=null,u=!1){var i=e,s=null,c=null,f=null,l=u?Pe:0;on(()=>{f!==(f=!!n())&&(f?(s?ke(s):s=pe(()=>r(i)),c&&xe(c,()=>{c=null})):(c?ke(c):t&&(c=pe(()=>t(i))),s&&xe(s,()=>{s=null})))},l)}function wt(e,n,r){var t=e,u,i;on(()=>{u!==(u=n())&&(i&&(xe(i),i=null),u&&(i=pe(()=>r(t,u))))})}function yt(e=!1){const n=p,r=n.l.u;if(!r)return;let t=()=>Tr(n.s);if(e){let u=0,i={};const s=we(()=>{let c=!1;const f=n.s;for(const l in f)f[l]!==i[l]&&(i[l]=f[l],c=!0);return c&&u++,u});t=()=>m(s)}r.b.length&&ir(()=>{Ye(n,t),be(r.b)}),je(()=>{const u=ce(()=>r.m.map(Kn));return()=>{for(const i of u)typeof i=="function"&&i()}}),r.a.length&&je(()=>{Ye(n,t),be(r.a)})}function Ye(e,n){if(e.l.s)for(const r of e.l.s)m(r);n()}const Cr={get(e,n){if(!e.exclude.includes(n))return e.props[n]},set(e,n){return!1},getOwnPropertyDescriptor(e,n){if(!e.exclude.includes(n)&&n in e.props)return{enumerable:!0,configurable:!0,value:e.props[n]}},has(e,n){return e.exclude.includes(n)?!1:n in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(n=>!e.exclude.includes(n))}};function mt(e,n,r){return new Proxy({props:e,exclude:n},Cr)}const Dr={get(e,n){if(!e.exclude.includes(n))return m(e.version),n in e.special?e.special[n]():e.props[n]},set(e,n,r){return n in e.special||(e.special[n]=Rr({get[n](){return e.props[n]}},n,Ge)),e.special[n](r),He(e.version),!0},getOwnPropertyDescriptor(e,n){if(!e.exclude.includes(n)&&n in e.props)return{enumerable:!0,configurable:!0,value:e.props[n]}},deleteProperty(e,n){return e.exclude.includes(n)||(e.exclude.push(n),He(e.version)),!0},has(e,n){return e.exclude.includes(n)?!1:n in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(n=>!e.exclude.includes(n))}};function Et(e,n){return new Proxy({props:e,exclude:n,special:{},version:A(0)},Dr)}const Nr={get(e,n){let r=e.props.length;for(;r--;){let t=e.props[r];if(_e(t)&&(t=t()),typeof t=="object"&&t!==null&&n in t)return t[n]}},getOwnPropertyDescriptor(e,n){let r=e.props.length;for(;r--;){let t=e.props[r];if(_e(t)&&(t=t()),typeof t=="object"&&t!==null&&n in t){const u=k(t,n);return u&&!u.configurable&&(u.configurable=!0),u}}},has(e,n){for(let r of e.props)if(_e(r)&&(r=r()),r!=null&&n in r)return!0;return!1},ownKeys(e){const n=[];for(let r of e.props){_e(r)&&(r=r());for(const t in r)n.includes(t)||n.push(t)}return n}};function gt(...e){return new Proxy({props:e},Nr)}function We(e){for(var n=d,r=d;n!==null&&!(n.f&(D|ae));)n=n.parent;try{return X(n),e()}finally{X(r)}}function Rr(e,n,r,t){var qe;var u=(r&Ln)!==0,i=(r&Mn)!==0,s=(r&qn)!==0,c=(r&Fn)!==0,f=e[n],l=(qe=k(e,n))==null?void 0:qe.set,a=t,o=!0,_=!1,v=()=>(_=!0,o&&(o=!1,c?a=ce(t):a=t),a);f===void 0&&t!==void 0&&(l&&i&&Jn(),f=v(),l&&l(f));var w;if(i)w=()=>{var E=e[n];return E===void 0?v():(o=!0,_=!1,E)};else{var T=We(()=>(u?we:or)(()=>e[n]));T.f|=nn,w=()=>{var E=m(T);return E!==void 0&&(a=void 0),E===void 0?a:E}}if(!(r&Ge))return w;if(l){var N=e.$$legacy;return function(E,H){return arguments.length>0?((!i||!H||N)&&l(H?w():E),E):w()}}var S=!1,q=!1,F=un(f),ue=We(()=>we(()=>{var E=w(),H=m(F);return S?(S=!1,q=!0,H):(q=!1,F.v=E)}));return u||(ue.equals=Ce),function(E,H){var Nn=m(ue);if(W&&(S=q,w(),m(F)),arguments.length>0){const ge=H?m(ue):i&&s?$(E):E;return ue.equals(ge)||(S=!0,O(F,ge),_&&a!==void 0&&(a=ge),m(ue)),E}return Nn}}export{qr as $,ce as A,ar as B,p as C,cr as D,je as E,Xe as F,Ur as G,Yr as H,Tr as I,Wr as J,lt as K,Hr as L,Je as M,Vn as N,ur as O,un as P,Wn as Q,Le as R,B as S,on as T,kn as U,ke as V,pe as W,xe as X,z as Y,d as Z,Mr as _,_t as a,kr as a0,A as a1,vn as a2,it as a3,sr as a4,re as a5,Fr as a6,jr as a7,Me as a8,Se as a9,k as aa,nt as ab,st as ac,$ as ad,$e as ae,Kr as af,He as ag,Fe as ah,Zr as ai,zr as aj,we as ak,Pe as al,Jr as am,Qr as an,Xr as ao,mt as ap,dt as aq,pt as ar,Lr as as,Vr as at,xr as b,gt as c,ot as d,Gr as e,tt as f,vt as g,et as h,yt as i,rt as j,ct as k,m as l,or as m,Br as n,Et as o,br as p,Rr as q,ht as r,ut as s,at as t,ft as u,O as v,wt as w,$r as x,fn as y,me as z};