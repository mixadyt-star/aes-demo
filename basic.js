sleep_speed = 0

function hex(x) {
    return x.toString(16)
}

function bin(x) {
    tmp = x.toString(2)
    return '0'.repeat(8 - tmp.length) + tmp
}

function sleep(ms) {
    if (sleep_speed >= 0) {
        return new Promise(resolve => setTimeout(resolve, ms - ms / 10 * sleep_speed))
    } else {
        return new Promise(resolve => setTimeout(resolve, ms - 100 * sleep_speed))
    }
}

function get_message_cells() {
    return [...document.querySelectorAll('[id^=message-0]'), ...document.querySelectorAll('[id^=message-1]'), ...document.querySelectorAll('[id^=message-2]'), ...document.querySelectorAll('[id^=message-3]')]
}

function get_key_cells() {
    return document.querySelectorAll('[id^=key]')
}

function get_constant_cells() {
    return document.querySelectorAll('[id^=constant]')
}

function get_operations() {
    return Array(...document.getElementsByClassName("operation"))
}

function calc_offset_x(cell) {
    return -63 * parseInt(cell.id.split('-')[2])
}

function calc_offset_y(cell) {
    return -63 * parseInt(cell.id.split('-')[1])
}

function move_cell_to(cell, pos, calc_offset = false) {
    if (calc_offset) {
        cell.style.transform = `translate(${pos[0] + calc_offset_x(cell)}px, ${pos[1] + calc_offset_y(cell)}px)`
    } else {
        cell.style.transform = `translate(${pos[0]}px, ${pos[1]}px)`
    }
}

function move_unpinned_to(operation, pos) {
    operation.style.left = `${pos[0] + 25}px`
    operation.style.top = `${pos[1] + 25}px`
}

function hide_operation(operation) {
    operation.style.opacity = 0
}

function show_operation(operation) {
    setTimeout(() => {
        operation.style.opacity = 1
    }, 50)
}

function hide_cell(cell) {
    cell.style.opacity = 0
}

function show_cell(cell) {
    setTimeout(() => {
        cell.style.opacity = 1
    }, 50)
}

function create_operation(op) {
    const div = document.createElement('div')
    div.className = 'operation'
    div.textContent = op
    if (sleep_speed >= 0) {
        div.style.transition = `opacity ${200 - 20 * sleep_speed}ms ease-in-out`
    } else {
        div.style.transition = `opacity ${200 - 100 * sleep_speed}ms ease-in-out`
    }
    document.body.appendChild(div)
    return div
}

function create_cell(content, cell_type, idi, idj) {
    const div = document.createElement('div')
    div.className = `main-cell ${cell_type}`
    div.textContent = content
    div.id = `${cell_type}-${idi}-${idj}`
    div.setAttribute("style", `grid-row: ${idi + 1}; grid-column: ${idj + 1};`)
    if (sleep_speed >= 0) {
        div.style.transition = `transform ${500 - 50 * sleep_speed}ms ease-in-out, opacity ${300 - 30 * sleep_speed}ms ease-in-out`
    } else {
        div.style.transition = `transform ${500 - 100 * sleep_speed}ms ease-in-out, opacity ${300 - 100 * sleep_speed}ms ease-in-out`
    }
    return div
}

function transition_off(cell) {
    tmp = cell.style.transition
    cell.style.transition = ""
    return tmp
}

function transition_on(cell, tmp) {
    cell.style.transition = tmp
}

function unpin_cell(cell) {
    cell.style.position = "absolute"
    document.body.appendChild(cell.parentElement.removeChild(cell))
}

function multiply_gf2_8(a, b) {
    let result = 0

    while (b > 0) {
        if (b & 1) {
            result ^= a
        }
        a <<= 1

        if (a & 0x100) {
            a ^= 0x11b
        }
        b >>= 1
    }

    return result
}

async function change_round_text(text_inp) {
    text = document.getElementById("round-text")
    text.style.opacity = 0
    
    await sleep(300)
    text.innerText = text_inp
    text.style.opacity = 1
}