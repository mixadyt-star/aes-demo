function change_speed_css(class_name, transition) {
    document.querySelectorAll(`.${class_name}`).forEach((el) => {
        el.style.transition = transition
    })
}

function change_speed() {
    speed_coef = document.getElementById("speed").value
    if (speed_coef >= 0) {
        change_speed_css("operation", `opacity ${200 - 20 * speed_coef}ms ease-in-out`)
        change_speed_css("main-cell", `transform ${500 - 50 * speed_coef}ms ease-in-out, opacity ${300 - 30 * speed_coef}ms ease-in-out`)
        sleep_speed = speed_coef
    } else {
        change_speed_css("operation", `opacity ${200 - 100 * speed_coef}ms ease-in-out`)
        change_speed_css("main-cell", `transform ${500 - 100 * speed_coef}ms ease-in-out, opacity ${300 - 100 * speed_coef}ms ease-in-out`)
        sleep_speed = speed_coef
    }
}