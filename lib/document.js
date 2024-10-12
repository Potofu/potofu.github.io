window.libraries = window.libraries||{};
window.libraries['Document'] = (()=>{
    "use strict";
    const ElementManager = function(elem,props,events){
        this._elem = elem;
        if (props) {
            Object.entries(props).forEach(([key,value])=>{
                if (key==='text') {
                    elem.textContent = value;
                } else {
                    elem[key] = value;
                }
            });
        }
        if (events) {
            Object.entries(events).forEach(([type,callback])=>{
                elem.addEventListener(type,callback);
            });
        }
    };
    ElementManager.prototype = {
        get next(){
            const next_sibling = this._elem.nextSibling;
            return next_sibling&&new ElementManager(next_sibling);
        },
        get value(){
            return this._elem.value;
        },
        set value(v){
            this._elem.value = v;
        },
        get text(){
            return this._elem.textContent;
        },
        set text(t){
            this._elem.textContent = t;
        }
    };
    ElementManager.prototype.append = function(em){
        this._elem.appendChild(em._elem);
    };
    ElementManager.prototype.free = function(){
        if (this._elem.parentNode) {
            this._elem.parentNode.removeChild(this._elem);
        }
    };
    ElementManager.prototype.add = function(tag_name,props,events){
        const em = ElementManager.create(tag_name,props,events);
        this.append(em);
        return em;
    };
    ElementManager.prototype.addText = function(text){
        const em = ElementManager.createText(text);
        this.append(em);
        return em;
    };
    ElementManager.prototype.getValue = function(key){
        return this._elem[key];
    };
    ElementManager.prototype.setValue = function(key,value){
        return this._elem[key] = value;
    };
    ElementManager.prototype.setStyle = function(style_obj){
        Object.entries(style_obj).forEach(([key,value])=>{
            this._elem.style[key] = value;
        })
    };
    ElementManager.create = function(tag_name,props,events){
        const e = document.createElement(tag_name);
        const em = new ElementManager(e,props,events);
        return em;
    };
    ElementManager.createText = function(text){
        const e = document.createTextNode(text);
        const em = new ElementManager(e);
        return em;
    };
    
    const SelectorItem = function(label,value,extended_values,onchange,selected){
        this.label = label;
        this.value = value;
        this._ext = extended_values;
        this._onchange = onchange;
        this.selected = selected||false;
    };
    SelectorItem.prototype.onselected = function(e){
        if (this._onchange) {
            this._onchange(e,this._ext);
        }
    };
    
    const SelectorMaker = function(list,onchange_before,onchange_after){
        const select = this._select = ElementManager.create('select',null,{change:e=>{
            onchange_before&&onchange_before(e);
            list.some(item=>{
                if (item.value===select.value) {
                    item.onselected(e);
                    return true;
                }
            });
            onchange_after&&onchange_after(e);
        }});
        list.forEach((e,i)=>{
            if (e===SelectorMaker.SEP) {
                const hr = select.add('hr');
            } else if (e instanceof SelectorItem) {
                const props = {label:e.label,value:e.value};
                if (e.selected) {
                    props['selected'] = true;
                }
                select.add('option',props);
            }
        });
        
    };
    SelectorMaker.prototype.elem = function(){
        return this._select;
    };
    SelectorMaker.prototype.select = function(){
        return this._select._elem.dispatchEvent(new Event('change'));
    };
    SelectorMaker.SEP = Symbol('Separator');
    SelectorMaker.item = (label,value,extended_values,onchange,selected)=>{
        return new SelectorItem(label,value,extended_values,onchange,selected);
    };
    
    return {ElementManager,SelectorMaker};
})();
