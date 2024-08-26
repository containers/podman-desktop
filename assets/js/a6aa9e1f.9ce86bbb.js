"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[93089],{8787:(e,t,n)=>{n.r(t),n.d(t,{default:()=>j});n(27378);var s=n(40624),a=n(50353),r=n(88676),i=n(75484),l=n(5720),o=n(20013),c=n(60505),d=n(2134),m=n(7092),g=n(6298),u=n(24246);function h(e){const t=(0,g.CS)(e);return(0,u.jsx)(m.Z,{children:(0,u.jsx)("script",{type:"application/ld+json",children:JSON.stringify(t)})})}function x(e){const{metadata:t}=e,{siteConfig:{title:n}}=(0,a.Z)(),{blogDescription:s,blogTitle:i,permalink:l}=t,o="/"===l?n:i;return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(r.d,{title:o,description:s}),(0,u.jsx)(c.Z,{tag:"blog_posts_list"})]})}function p(e){const{metadata:t,items:n,sidebar:s}=e;return(0,u.jsxs)(l.Z,{sidebar:s,children:[(0,u.jsx)(d.Z,{items:n}),(0,u.jsx)(o.Z,{metadata:t})]})}function j(e){return(0,u.jsxs)(r.FG,{className:(0,s.Z)(i.k.wrapper.blogPages,i.k.page.blogListPage),children:[(0,u.jsx)(x,{...e}),(0,u.jsx)(h,{...e}),(0,u.jsx)(p,{...e})]})}},20013:(e,t,n)=>{n.d(t,{Z:()=>i});n(27378);var s=n(99213),a=n(14582),r=n(24246);function i(e){const{metadata:t}=e,{previousPage:n,nextPage:i}=t;return(0,r.jsxs)("nav",{className:"pagination-nav","aria-label":(0,s.I)({id:"theme.blog.paginator.navAriaLabel",message:"Blog list page navigation",description:"The ARIA label for the blog pagination"}),children:[n&&(0,r.jsx)(a.Z,{permalink:n,title:(0,r.jsx)(s.Z,{id:"theme.blog.paginator.newerEntries",description:"The label used to navigate to the newer blog posts page (previous page)",children:"Newer entries"})}),i&&(0,r.jsx)(a.Z,{permalink:i,title:(0,r.jsx)(s.Z,{id:"theme.blog.paginator.olderEntries",description:"The label used to navigate to the older blog posts page (next page)",children:"Older entries"}),isNext:!0})]})}},54744:(e,t,n)=>{n.d(t,{Z:()=>C});n(27378);var s=n(40624),a=n(6298),r=n(24246);function i(e){let{children:t,className:n}=e;return(0,r.jsx)("article",{className:n,children:t})}var l=n(36641);const o={title:"title_Kdtz"};function c(e){let{className:t}=e;const{metadata:n,isBlogPostPage:i}=(0,a.nO)(),{permalink:c,title:d}=n,m=i?"h1":"h2";return(0,r.jsx)(m,{className:(0,s.Z)(o.title,t),children:i?d:(0,r.jsx)(l.Z,{to:c,children:d})})}var d=n(99213),m=n(40689),g=n(70925);const u={container:"container_iZB2"};function h(e){let{readingTime:t}=e;const n=function(){const{selectMessage:e}=(0,m.c)();return t=>{const n=Math.ceil(t);return e(n,(0,d.I)({id:"theme.blog.post.readingTime.plurals",description:'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',message:"One min read|{readingTime} min read"},{readingTime:n}))}}();return(0,r.jsx)(r.Fragment,{children:n(t)})}function x(e){let{date:t,formattedDate:n}=e;return(0,r.jsx)("time",{dateTime:t,children:n})}function p(){return(0,r.jsx)(r.Fragment,{children:" \xb7 "})}function j(e){let{className:t}=e;const{metadata:n}=(0,a.nO)(),{date:i,readingTime:l}=n,o=(0,g.P)({day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});return(0,r.jsxs)("div",{className:(0,s.Z)(u.container,"margin-vert--md",t),children:[(0,r.jsx)(x,{date:i,formattedDate:(c=i,o.format(new Date(c)))}),void 0!==l&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(p,{}),(0,r.jsx)(h,{readingTime:l})]})]});var c}var b=n(32145);const f={authorCol:"authorCol_v1VX",imageOnlyAuthorRow:"imageOnlyAuthorRow_RxZ1",imageOnlyAuthorCol:"imageOnlyAuthorCol_iWtj"};function Z(e){let{className:t}=e;const{metadata:{authors:n},assets:i}=(0,a.nO)();if(0===n.length)return null;const l=n.every((e=>{let{name:t}=e;return!t})),o=1===n.length;return(0,r.jsx)("div",{className:(0,s.Z)("margin-top--md margin-bottom--sm",l?f.imageOnlyAuthorRow:"row",t),children:n.map(((e,t)=>(0,r.jsx)("div",{className:(0,s.Z)(!l&&(o?"col col--12":"col col--6"),l?f.imageOnlyAuthorCol:f.authorCol),children:(0,r.jsx)(b.Z,{author:{...e,imageURL:i.authorsImageUrls[t]??e.imageURL}})},t)))})}function v(){return(0,r.jsxs)("header",{children:[(0,r.jsx)(c,{}),(0,r.jsx)(j,{}),(0,r.jsx)(Z,{})]})}var N=n(51721),w=n(40450);function k(e){let{children:t,className:n}=e;const{isBlogPostPage:i}=(0,a.nO)();return(0,r.jsx)("div",{id:i?N.uR:void 0,className:(0,s.Z)("markdown",n),children:(0,r.jsx)(w.Z,{children:t})})}var T=n(75484),P=n(54709),y=n(28349);function O(){return(0,r.jsx)("b",{children:(0,r.jsx)(d.Z,{id:"theme.blog.post.readMore",description:"The label used in blog post item excerpts to link to full blog posts",children:"Read more"})})}function R(e){const{blogPostTitle:t,...n}=e;return(0,r.jsx)(l.Z,{"aria-label":(0,d.I)({message:"Read more about {title}",id:"theme.blog.post.readMoreLabel",description:"The ARIA label for the link to full blog posts from excerpts"},{title:t}),...n,children:(0,r.jsx)(O,{})})}function A(){const{metadata:e,isBlogPostPage:t}=(0,a.nO)(),{tags:n,title:i,editUrl:l,hasTruncateMarker:o,lastUpdatedBy:c,lastUpdatedAt:d}=e,m=!t&&o,g=n.length>0;if(!(g||m||l))return null;if(t){const e=!!(l||d||c);return(0,r.jsxs)("footer",{className:"docusaurus-mt-lg",children:[g&&(0,r.jsx)("div",{className:(0,s.Z)("row","margin-top--sm",T.k.blog.blogFooterEditMetaRow),children:(0,r.jsx)("div",{className:"col",children:(0,r.jsx)(y.Z,{tags:n})})}),e&&(0,r.jsx)(P.Z,{className:(0,s.Z)("margin-top--sm",T.k.blog.blogFooterEditMetaRow),editUrl:l,lastUpdatedAt:d,lastUpdatedBy:c})]})}return(0,r.jsxs)("footer",{className:"row docusaurus-mt-lg",children:[g&&(0,r.jsx)("div",{className:(0,s.Z)("col",{"col--9":m}),children:(0,r.jsx)(y.Z,{tags:n})}),m&&(0,r.jsx)("div",{className:(0,s.Z)("col text--right",{"col--3":g}),children:(0,r.jsx)(R,{blogPostTitle:i,to:e.permalink})})]})}function C(e){let{children:t,className:n}=e;const l=function(){const{isBlogPostPage:e}=(0,a.nO)();return e?void 0:"margin-bottom--xl"}();return(0,r.jsxs)(i,{className:(0,s.Z)(l,n),children:[(0,r.jsx)(v,{}),(0,r.jsx)(k,{children:t}),(0,r.jsx)(A,{})]})}},2134:(e,t,n)=>{n.d(t,{Z:()=>i});n(27378);var s=n(6298),a=n(54744),r=n(24246);function i(e){let{items:t,component:n=a.Z}=e;return(0,r.jsx)(r.Fragment,{children:t.map((e=>{let{content:t}=e;return(0,r.jsx)(s.n4,{content:t,children:(0,r.jsx)(n,{children:(0,r.jsx)(t,{})})},t.metadata.permalink)}))})}},85978:(e,t,n)=>{n.d(t,{Z:()=>r});var s=n(10610),a=(n(27378),n(24246));function r(e){const t={...e};return t?.code?.length>2&&("$ "===t.code.substring(0,2)||"# "===t.code.substring(0,2)||"> "===t.code.substring(0,2))&&(t.code=t.code.substring(2)),(0,a.jsx)(a.Fragment,{children:(0,a.jsx)(s.Z,{...t})})}},35654:(e,t,n)=>{n.d(t,{Z:()=>o});var s=n(30537),a=n(9928),r=n(19374),i=n(92739),l=n(13067);s.vI.add(a.vnX,r.mRB);const o={...l.Z,Icon:i.G}}}]);