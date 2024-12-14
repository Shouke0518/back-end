function handleLoginForm(event) {
    event.preventDefault();

    var email = document.querySelector('input[type="text"]').value;
    var password = document.getElementById('password').value;
    const formData = {
        email: email,
        password: password
    };

    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(response => {
        if (response.ok) {
            password = "";
            console.log("登入成功");
            alert("登入成功");
            localStorage.setItem('isLogin', "yes");
            localStorage.setItem('user', email);
            getRole(email)
                .then(data => {
                    console.log(data);
                    if (data == "user") {
                        localStorage.setItem('role', "user");
                        window.location.href = "homePage.html";
                    } else if (data == "merchant") {
                        localStorage.setItem('role', "merchant");
                        window.location.href = "merchantPage.html";
                    }
                })
                .catch(error => {
                    console.error('Error fetching role:', error);
                });
        } else if (response.status === 429) {
            alert("嘗試次數過多!");
        } else {
            console.log("登入失败");
            alert("帳號或密碼錯誤");
        }
    }).catch(error => {
        console.error('錯誤:', error);
    });
}

async function getRole(email) {
    try {
        const response = await fetch('/db/role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email }),
        });

        if (response.ok) {
            console.log("成功");
            const data = await response.json();
            return data;
        } else {
            console.log("錯誤");
            throw new Error('錯誤');
        }
    } catch (error) {
        console.error('錯誤:', error);
        throw error;
    }
}

function loginByGoogle() {
    window.location.href = "auth/google";
}

function loginBygithub() {
    window.location.href = "auth/github";
}

function showPassword() {
    var passwordField = document.getElementById('password');
    var eyeIcon = document.querySelector('.eye-icon');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('bx-hide');
        eyeIcon.classList.add('bx-show');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('bx-show');
        eyeIcon.classList.add('bx-hide');
    }
}