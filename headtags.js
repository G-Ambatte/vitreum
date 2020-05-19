const React = require('react');

const obj2props = (obj)=>Object.entries(obj).map(([k,v])=>`${k}="${v}"`).join(' ')
const onServer = (typeof window === 'undefined');

const injectTag = require('./utils/injectTag.js');

let NamedTags = {};
let UnnamedTags = [];

const HeadComponents = {
	Title({ children }){
		if(onServer) NamedTags.title = `<title>${children.join('')}</title>`;
		React.useEffect(()=>{document.title = children.join('')}, [children]);
		return null;
	},
	Favicon({ type = 'image/png', href = '', rel='icon', id= 'favicon'}){
		if(onServer) NamedTags.favicon = `<link rel='shortcut icon' type="${type}" id="${id}" href="${href}" />`
		React.useEffect(()=>{document.getElementById(id).href=href}, [id, href]);
		return null;
	},

	Description({ children }){
		if(onServer) NamedTags.description = `<meta name='description' content='${children.join('')}' />`
		return null;
	},

	Noscript({ children }){
		if(onServer) UnnamedTags.push(`<noscript>${children.join('')}<\/noscript>`);
		return null;
	},
	Script({ children=[], ...props }){
		if(onServer) {
			UnnamedTags.push(children.length
				? `<script ${obj2props(props)}>${children.join('')}\<\/script>`
				: `<script ${obj2props(props)} />`
			);
		}
		return null;
	},
	Meta(props) {
    if (onServer) {}
    let tag = `<meta ${obj2props(props)} />`;
    props.property || props.name ? NamedTags[props.property || props.name] = tag : UnnamedTags.push(tag);
    React.useEffect(() => {
			document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', Object.values(NamedTags).join('\n'));
    },[NamedTags]);
		return null;
	},
	Style({ children, type='text/css' }){
		if(onServer) UnnamedTags.push(`<style type="${type}">${children.join('')}</style>`);
		return null;
	}
};

const Inject = ({tag, children, ...props})=>{
	React.useEffect(()=>{
		injectTag(tag, props, children);
	}, []);
	return null;
};


module.exports = {
	Inject,
	...HeadComponents,
	generate : ()=>Object.values(NamedTags).concat(UnnamedTags).join('\n'),
	flush : ()=>{
		NamedTags = {};
		UnnamedTags = [];
	}
};
