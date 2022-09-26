function Validator(options) {

    function getParentElement(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules = {};
    function validate(inputElement, rule) {
        var parentElement = getParentElement(inputElement, options.formGroupSelector);
        var errorElement = parentElement.querySelector(options.errorSelector);
        var errorMessage;

        var rules = selectorRules[rule.selector];
        for (let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            parentElement.classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            parentElement.classList.remove('invalid');
        }
        return !errorMessage;
    };
    //Lấy element của mỗi form
    var formElement = document.querySelector(options.form);
    if (formElement) {
        //Khi submit form
        formElement.onsubmit = function (event) {
            event.preventDefault();
            var isFormValid = true;
            //lặp qua từng rule và validate luôn
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {
                //Submit với JS
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce((values, input)=> {
                        values[input.name] = input.value;
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Submit mặc định
                else {
                    formElement.submit();
                }
            }
        };

        //Lặp qua mỗi rule và xử lý
        options.rules.forEach((rule) => {
            //Lưu các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                };
                inputElement.oninput = () => {
                    var parentElement = getParentElement(inputElement, options.formGroupSelector);
                    errorElement = parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    parentElement.classList.remove('invalid');
                };
            }
        });
    }
}

Validator.isRequired = function(selector, message) {
    return {
        selector,
        test(value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này!'
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email!';
        }
    };
}

Validator.minLength = function(selector, min, message) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự!`;
        }
    };
}

Validator.confirmPassword = function(selector, getConfirmValue, message) {
    return {
        selector,
        test(value) {
            return value === getConfirmValue() ? undefined : message || 'Xác minh sai. Vui lòng nhập lại!';
        }
    };
}