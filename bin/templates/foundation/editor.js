function makeEditableContainer(target, data) {
    if(typeof(data) == 'Object') {
        Object.keys(data).forEach(function(child){
            
        });
    }
    target.attributes['data-name'] = data;
    target.classList.add('edit-box');
}

Object.keys(window.page.directive).forEach(function(selector){
    console.log(selector);
    makeEditableContainer(document.querySelector(selector), window.page.directive[selector]);
});

document.querySelectorAll('.edit-box').forEach(function(editable) {
    editable.onclick = function(target) {
        target = target.target;
        var save = window.prompt("Editing " + target.attributes['data-name'], target.innerHTML);
        if(save) {
            target.innerHTML = save;
        }
    };
});