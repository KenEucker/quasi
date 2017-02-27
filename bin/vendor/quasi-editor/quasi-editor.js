function makeEditableContainer(target, data) {
    if(typeof(data) == 'Object') {
        Object.keys(data).forEach(function(child){
            
        });
    }
    try {
        target.attributes['data-name'] = data;
        target.classList.add('edit-content');
    }
    catch(e) {
        console.log('error making editable container for "' + target + '": ' + e);
    }
}

function makeEditableAttribute(target, attribute, data) {

    try {
        target.attributes['data-name'] = data;
        target.attributes['attribute-name'] = attribute;
        target.classList.add('edit-attribute');
    }
    catch(e) {
        console.log('error making editable attribute for "' + target + '": ' + e);
    }
}

function editContent(target) {
    var save = window.prompt("Editing " + target.attributes['data-name'], target.innerHTML);
    if(save) {
        target.innerHTML = save;
    }
}

function editAttribute(target) {
    var dataName = target.attributes['data-name'],
        attributeName = target.attributes['attribute-name'],
        save = window.prompt("Editing " + dataName, target.attributes[attributeName].value);
    if(save) {
        target.attributes[attributeName].value = save;
    }
}

window.addEventListener('load',function(){
    Object.keys(window.page.directive).forEach(function(selector){
        console.log("current selector: " + selector);
        if(selector.indexOf('@') != -1) {
            let split = selector.split('@');
            console.log('wiring up editable attribute for ' + selector);
            makeEditableAttribute(document.querySelector(split[0]), split[1], window.page.directive[selector]);
        } else {
        console.log('wiring up editable content for ' + selector);
            makeEditableContainer(document.querySelector(selector), window.page.directive[selector]);
        }
    });

    document.querySelectorAll('.edit-content').forEach(function(editable) {
        editable.addEventListener("click", function(event) {
            event.preventDefault();
            editContent(event.target);
        });
    });

    document.querySelectorAll('.edit-attribute').forEach(function(editable) {
        editable.addEventListener("click", function(event) {
            event.preventDefault();
            editAttribute(event.target);
        });
    });
});