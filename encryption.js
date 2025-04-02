async function add_round_key() {
    message_cells = get_message_cells()
    key_cells = get_key_cells()

    xor = create_operation("+")
    move_unpinned_to(xor, [560, 100 + operation_offset_y])
    show_operation(xor)

    equal = create_operation("=")
    move_unpinned_to(equal, [650, 100 + operation_offset_y])
    show_operation(equal)

    for (let i = 0; i < 16; i++) {
        move_cell_to(message_cells[i], [500, 100], true)
        move_cell_to(key_cells[i], [590, 100 + key_offset_y], true)
        await sleep(500)

        unpin_cell(message_cells[i])
        move_cell_to(message_cells[i], [0, 0])
        move_unpinned_to(message_cells[i], [500, 100])

        result = hex(parseInt(message_cells[i].innerHTML, 16) ^ parseInt(key_cells[i].innerHTML, 16))
        cell = create_cell(result, "message", Math.floor(i / 4), i % 4)
        hide_cell(cell)
        move_cell_to(cell, [680, 100], true)
        render_message.appendChild(cell)
        show_cell(cell)
        await sleep(400)

        move_cell_to(cell, [0, 0])
        move_cell_to(key_cells[i], [0, 0])
        hide_cell(message_cells[i])
        await sleep(300)
        
        document.body.removeChild(message_cells[i])
    }

    hide_operation(xor)
    hide_operation(equal)
    await sleep(500)
}

sbox_matrix_const = [
    [1, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
]
sbox_bias_const = [1, 1, 0, 0, 0, 1, 1, 0]
async function spawn_subbyte_const() {
    let i = 0
    for (i; i < 8; i++) {
        let j = 0
        for (j; j < 8; j ++) {
            cell = create_cell(String(sbox_matrix_const[i][j]), "constant", i, j)
            cell.style.width = "30px"
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [500 + j * 120, 100 + i * 60])
            show_cell(cell)
    
            multiply = create_operation("*")
            move_unpinned_to(multiply, [530 + j * 120, 100 + operation_offset_y + i * 60])
            show_operation(multiply)
    
            xor = create_operation("+")
            move_unpinned_to(xor, [590 + j * 120, 100 + operation_offset_y + i * 60])
            show_operation(xor)
        }
        cell = create_cell(String(sbox_bias_const[i]), "constant", i, j)
        cell.style.width = "30px"
        hide_cell(cell)
        document.body.appendChild(cell)
        unpin_cell(cell)
        move_unpinned_to(cell, [500 + j * 120, 100 + i * 60])
        show_cell(cell)

        equal = create_operation("=")
        move_unpinned_to(equal, [530 + j * 120, 100 + operation_offset_y + i * 60])
        show_operation(equal)
    }
}

async function merge_cells(i) {
    for (let j = 0; j < 8; j++) {
        bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
        move_cell_to(bit, [30, 60 * (4 - j)])
    }
    await sleep(400)

    for (let j = 0; j < 8; j++) {
        bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
        hide_cell(bit)
    }
    await sleep(300)

    result = []
    for (let j = 0; j < 8; j++) {
        bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
        result.push(bit.innerHTML)
        document.body.removeChild(bit)
    }
    result.reverse()

    let cell = create_cell(hex(parseInt(String(result).replaceAll(',', ''), 2)), "message", Math.floor(i / 4), i % 4)
    hide_cell(cell)
    render_message.appendChild(cell)
    move_cell_to(cell, [1550, 340], true)
    show_cell(cell)
    await sleep(300)

    move_cell_to(cell, [0, 0])
}

async function hide_constants_sub_byte(i) {
    for (let z = 0; z < 8; z++) {
        bit = document.getElementById(`constant-${i + 0xffff}-${z + 0xffff}`)
        move_cell_to(bit, [0, 560])
        hide_cell(bit)
    }
    await sleep(300)

    for (let z = 0; z < 8; z++) {
        bit = document.getElementById(`constant-${i + 0xffff}-${z + 0xffff}`)
        document.body.removeChild(bit)
    }
}

async function sub_byte_apply() {
    message_cells = get_message_cells()
    spawn_subbyte_const()

    equal = create_operation("=")
    move_unpinned_to(equal, [530, 40 + operation_offset_y])
    show_operation(equal)

    for (let i = 0; i < 16; i++) {
        move_cell_to(message_cells[i], [470, 40], true)
        await sleep(500)

        unpin_cell(message_cells[i])
        move_cell_to(message_cells[i], [0, 0])
        move_unpinned_to(message_cells[i], [470, 40])

        binary = bin(parseInt(message_cells[i].innerHTML, 16))

        for (let j = 0; j < 8; j++) {
            cell = create_cell(binary[j], "constant", i + 0xffff, j + 0xffff)
            cell.style.width = "30px"
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [560 + j * 120, 40])
            show_cell(cell)
        }

        await sleep(300)

        for (let j = 0; j < 8; j++) {
            for (let z = 0; z < 8; z++) {
                bit = document.getElementById(`constant-${i + 0xffff}-${z + 0xffff}`)
                move_cell_to(bit, [0, 60 * (j + 1)])
            }

            result = 0
            for (let tmp = 0; tmp < 8; tmp++) {
                if (sbox_matrix_const[j][tmp]) {
                    result = result ^ parseInt(binary[tmp])
                }
            }
            if (sbox_bias_const[j]) {
                result = 1 - result
            }

            cell = create_cell(String(result), "constant", i + 0xaaaa, j + 0xaaaa)
            cell.style.width = "30px"
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [1520, 100 + j * 60])
            show_cell(cell)
            await sleep(500)
        }

        hide_constants_sub_byte(i)
        merge_cells(i)
    
        hide_cell(message_cells[i])
        await sleep(300)

        document.body.removeChild(message_cells[i])
        await sleep(200)
    }
    get_constant_cells().forEach((el) => {
        hide_cell(el)
    })
    get_operations().forEach((el) => {
        hide_operation(el)
    })
    await sleep(500)
    get_constant_cells().forEach((el) => {
        document.body.removeChild(el)
    })
    get_operations().forEach((el) => {
        document.body.removeChild(el)
    })
}

invert_sbox_constants = [
    0b10011010,
    0b01001101,
    0b10101011,
    0b11011000,
    0b01101100,
    0b00110110,
    0b00011011,
]

async function spawn_subbyte_const_invert() {
    for (let i = 0; i < 7; i++) {
        cell = create_cell(hex(invert_sbox_constants[i]), "constant", 0, i)
        hide_cell(cell)
        document.body.appendChild(cell)
        unpin_cell(cell)
        move_unpinned_to(cell, [500 + 150 * i, 200])
        show_cell(cell)

        multiplication = create_operation("*")
        move_unpinned_to(multiplication, [560 + 150 * i, 200 + operation_offset_y])
        show_operation(multiplication)

        xor = create_operation("+")
        move_unpinned_to(xor, [620 + 150 * i, 200 + operation_offset_y])
        show_operation(xor)
    }

    for (let i = 0; i < 6; i++) {
        multiplication = create_operation("*")
        move_unpinned_to(multiplication, [560 + 90 * i, 400 + operation_offset_y])
        show_operation(multiplication)
    }
    equal = create_operation("=")
    move_unpinned_to(equal, [1610, 200 + operation_offset_y])
    show_operation(equal)

    equal = create_operation("=")
    move_unpinned_to(equal, [1100, 400 + operation_offset_y])
    show_operation(equal)
}

async function hide_constant_invert(i) {
    bit = document.getElementById(`constant-${i + 0xbbbb}-${0xbbbb}`)
    hide_cell(bit)
    for (let j = 0; j < 7; j++) {
        bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
        hide_cell(bit)
    }
    await sleep(300)

    document.body.removeChild(document.getElementById(`constant-${i + 0xbbbb}-${0xbbbb}`))
    for (let j = 0; j < 7; j++) {
        document.body.removeChild(document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`))
    }
}

async function sub_byte_invert() {
    message_cells = get_message_cells()
    spawn_subbyte_const_invert()

    equal = create_operation("=")
    move_unpinned_to(equal, [590, 100 + operation_offset_y])
    show_operation(equal)

    for (let i = 0; i < 16; i++) {
        move_cell_to(message_cells[i], [500, 100], true)
        await sleep(500)

        unpin_cell(message_cells[i])
        move_cell_to(message_cells[i], [0, 0])
        move_unpinned_to(message_cells[i], [500, 100])

        binary = bin(parseInt(message_cells[i].innerHTML, 16))

        for (let j = 0; j < 8; j++) {
            if (j < 4) {
                cell = create_cell(binary[j], "constant", i + 0xaaaa, j * 2 + 0xaaaa)
            } else {
                cell = create_cell(binary[j], "constant", i + 0xffff, (j - 4) * 2 + 0x10000)
            }
            cell.style.width = "30px"
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [620 + j * 60, 100])
            show_cell(cell)
        }
        await sleep(300)

        squared = create_operation("2")
        move_unpinned_to(squared, [560, 100])
        show_operation(squared)

        for (let j = 0; j < 7; j++) {
            if (j < 3) {
                cell = create_cell(0, "constant", i + 0xaaaa, j * 2 + 0xaaab)
            } else {
                cell = create_cell(0, "constant", i + 0xffff, (j - 3) * 2 + 0xffff)
            }
            cell.style.width = "30px"
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [650 + j * 60, 100])
            show_cell(cell)
        }
        await sleep(300)
        hide_cell(message_cells[i])
        hide_operation(squared)

        for (let j = 0; j < 7; j++) {
            bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
            move_cell_to(bit, [-30 + 120 * j, 100])
        }

        for (let j = 0; j < 8; j++) {
            bit = document.getElementById(`constant-${i + 0xffff}-${j + 0xffff}`)
            move_cell_to(bit, [720 - 30 * j, 100])
        }
        await sleep(500)

        document.body.removeChild(message_cells[i])
        document.body.removeChild(squared)

        for (let j = 0; j < 8; j++) {
            bit = document.getElementById(`constant-${i + 0xffff}-${j + 0xffff}`)
            hide_cell(bit)
        }
        await sleep(300)

        result = ""
        for (let j = 0; j < 8; j++) {
            bit = document.getElementById(`constant-${i + 0xffff}-${j + 0xffff}`)
            result += bit.innerHTML
            document.body.removeChild(bit)
        }
        result = parseInt(result, 2)

        cell = create_cell(hex(result), "constant", i + 0xbbbb, 0xbbbb)
        hide_cell(cell)
        document.body.appendChild(cell)
        unpin_cell(cell)
        move_unpinned_to(cell, [1550, 200])
        show_cell(cell)
        await sleep(500)

        result = 0
        for (let j = 0; j < 7; j++) {
            bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
            result = result ^ parseInt(bit.innerHTML) * invert_sbox_constants[j]
        }
        result = result ^ parseInt(document.getElementById(`constant-${i + 0xbbbb}-${0xbbbb}`).innerHTML, 16)

        main_cell = create_cell(hex(result), "constant", i + 0xcccc, 0xcccc)
        hide_cell(main_cell)
        document.body.appendChild(main_cell)
        unpin_cell(main_cell)
        move_unpinned_to(main_cell, [1640, 200])
        show_cell(main_cell)

        hide_constant_invert(i)
        await sleep(300)

        for (let tmp = 0; tmp < 6; tmp++) {
            move_cell_to(main_cell, [-1140, -100])
            await sleep(500)

            binary = bin(parseInt(main_cell.innerHTML, 16))

            for (let j = 0; j < 8; j++) {
                if (j < 4) {
                    cell = create_cell(binary[j], "constant", i + 0xaaaa, j * 2 + 0xaaaa)
                } else {
                    cell = create_cell(binary[j], "constant", i + 0xffff, (j - 4) * 2 + 0x10000)
                }
                cell.style.width = "30px"
                hide_cell(cell)
                document.body.appendChild(cell)
                unpin_cell(cell)
                move_unpinned_to(cell, [620 + j * 60, 100])
                show_cell(cell)
            }
            await sleep(300)

            squared = create_operation("2")
            move_unpinned_to(squared, [560, 100])
            show_operation(squared)

            for (let j = 0; j < 7; j++) {
                if (j < 3) {
                    cell = create_cell(0, "constant", i + 0xaaaa, j * 2 + 0xaaab)
                } else {
                    cell = create_cell(0, "constant", i + 0xffff, (j - 3) * 2 + 0xffff)
                }
                cell.style.width = "30px"
                hide_cell(cell)
                document.body.appendChild(cell)
                unpin_cell(cell)
                move_unpinned_to(cell, [650 + j * 60, 100])
                show_cell(cell)
            }
            await sleep(300)

            move_cell_to(main_cell, [-1140 + 90 * tmp, 200])
            hide_operation(squared)

            for (let j = 0; j < 7; j++) {
                bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
                move_cell_to(bit, [-30 + 120 * j, 100])
            }

            for (let j = 0; j < 8; j++) {
                bit = document.getElementById(`constant-${i + 0xffff}-${j + 0xffff}`)
                move_cell_to(bit, [720 - 30 * j, 100])
            }
            await sleep(500)

            document.body.removeChild(squared)

            for (let j = 0; j < 8; j++) {
                bit = document.getElementById(`constant-${i + 0xffff}-${j + 0xffff}`)
                hide_cell(bit)
            }
            await sleep(300)

            result = ""
            for (let j = 0; j < 8; j++) {
                bit = document.getElementById(`constant-${i + 0xffff}-${j + 0xffff}`)
                result += bit.innerHTML
                document.body.removeChild(bit)
            }
            result = parseInt(result, 2)

            cell = create_cell(hex(result), "constant", i + 0xbbbb, 0xbbbb)
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [1550, 200])
            show_cell(cell)
            await sleep(500)

            result = 0
            for (let j = 0; j < 7; j++) {
                bit = document.getElementById(`constant-${i + 0xaaaa}-${j + 0xaaaa}`)
                result = result ^ parseInt(bit.innerHTML) * invert_sbox_constants[j]
            }
            result = result ^ parseInt(document.getElementById(`constant-${i + 0xbbbb}-${0xbbbb}`).innerHTML, 16)

            main_cell = create_cell(hex(result), "constant", i + 0xcccc, tmp + 0xcccd)
            hide_cell(main_cell)
            document.body.appendChild(main_cell)
            unpin_cell(main_cell)
            move_unpinned_to(main_cell, [1640, 200])
            show_cell(main_cell)

            hide_constant_invert(i)
            await sleep(300)
        }

        move_cell_to(main_cell, [-600, 200])
        await sleep(500)

        result = 1
        for (let j = 0; j < 7; j++) {
            result = multiply_gf2_8(result, parseInt(document.getElementById(`constant-${i + 0xcccc}-${j + 0xcccc}`).innerHTML, 16))
        }

        cell = create_cell(hex(result), "message", Math.floor(i / 4), i % 4)
        hide_cell(cell)
        render_message.appendChild(cell)
        move_cell_to(cell, [1160, 400], true)
        show_cell(cell)
    
        for (let j = 0; j < 7; j++) {
            hide_cell(document.getElementById(`constant-${i + 0xcccc}-${j + 0xcccc}`))
        }
        await sleep(300)

        for (let j = 0; j < 7; j++) {
            document.body.removeChild(document.getElementById(`constant-${i + 0xcccc}-${j + 0xcccc}`))
        }

        move_cell_to(cell, [0, 0])
    }
    get_constant_cells().forEach((el) => {
        hide_cell(el)
    })
    get_operations().forEach((el) => {
        hide_operation(el)
    })
    await sleep(500)
    get_constant_cells().forEach((el) => {
        document.body.removeChild(el)
    })
    get_operations().forEach((el) => {
        document.body.removeChild(el)
    })
}

async function shift_rows() {
    await sleep(500)
    message_cells = get_message_cells()

    move_cell_to(message_cells[4], [252, 0])

    for (let i = 8; i < 10; i++) {
        move_cell_to(message_cells[i], [252, 0])
    }

    for (let i = 12; i < 15; i++) {
        move_cell_to(message_cells[i], [252, 0])
    }
    await sleep(500)

    unpin_cell(message_cells[4])
    move_unpinned_to(message_cells[4], [252, 63])
    move_cell_to(message_cells[4], [0, 0])

    for (let i = 8; i < 10; i++) {
        unpin_cell(message_cells[i])
        move_unpinned_to(message_cells[i], [252 + (i - 8) * 63, 126])
        move_cell_to(message_cells[i], [0, 0])
    }

    for (let i = 12; i < 15; i++) {
        unpin_cell(message_cells[i])
        move_unpinned_to(message_cells[i], [252 + (i - 12) * 63, 189])
        move_cell_to(message_cells[i], [0, 0])
    }
    await sleep(500)

    for (let i = 4; i < 8; i++) {
        move_cell_to(message_cells[i], [-63, 0])
    }

    for (let i = 8; i < 12; i++) {
        move_cell_to(message_cells[i], [-126, 0])
    }

    for (let i = 12; i < 16; i++) {
        move_cell_to(message_cells[i], [-189, 0])
    }
    await sleep(500)

    message_cells[4].id = "message-1-3"
    message_cells[4].style.gridArea = "2 / 4"
    message_cells[4].style.position = ""
    render_message.appendChild(message_cells[4])

    for (let i = 8; i < 10; i++) {
        message_cells[i].id = `message-2-${i - 6}`
        message_cells[i].style.gridArea = `3 / ${i - 5}`
        message_cells[i].style.position = ""
        render_message.appendChild(message_cells[i])
    }

    for (let i = 12; i < 15; i++) {
        message_cells[i].id = `message-3-${i - 11}`
        message_cells[i].style.gridArea = `4 / ${i - 10}`
        message_cells[i].style.position = ""
        render_message.appendChild(message_cells[i])
    }

    for (let i = 5; i < 8; i++) {
        message_cells[i].id = `message-1-${i - 5}`
        message_cells[i].style.gridArea = `2 / ${i - 4}`
    }

    for (let i = 10; i < 12; i++) {
        message_cells[i].id = `message-2-${i - 10}`
        message_cells[i].style.gridArea = `3 / ${i - 9}`
    }

    message_cells[15].id = "message-3-0"
    message_cells[15].style.gridArea = "4 / 1"

    for (let i = 4; i < 16; i++) {
        tmp = transition_off(message_cells[i])
        move_cell_to(message_cells[i], [0, 0])
    }

    await sleep(1)
    for (let i = 4; i < 16; i++) {
        transition_on(message_cells[i], tmp)
    }

    await sleep(500)
}

mix_columns_constant = [
    [2, 3, 1, 1],
    [1, 2, 3, 1],
    [1, 1, 2, 3],
    [3, 1, 1, 2],
]

async function spawn_mix_columns_constant() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            cell = create_cell(hex(mix_columns_constant[i][j]), "constant", i, j)
            hide_cell(cell)
            document.body.appendChild(cell)
            unpin_cell(cell)
            move_unpinned_to(cell, [500 + 180 * j, 100 + i * 60])
            show_cell(cell)

            multiplication = create_operation("*")
            move_unpinned_to(multiplication, [560 + 180 * j, 100 + operation_offset_y + i * 60])
            show_operation(multiplication)

            xor = create_operation("+")
            move_unpinned_to(xor, [650 + 180 * j, 100 + operation_offset_y + i * 60])
            show_operation(xor)
        }
        equal = create_operation("=")
        move_unpinned_to(equal, [1190, 100 + operation_offset_y + i * 60])
        show_operation(equal)
    }
}

async function mix_columns() {
    message_cells = get_message_cells()
    spawn_mix_columns_constant()

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            move_cell_to(message_cells[i + j * 4], [590 + j * 180, 100], true)
        }
        await sleep(500)

        for (let j = 0; j < 4; j++) {
            unpin_cell(message_cells[i + j * 4])
            move_unpinned_to(message_cells[i + j * 4], [590 + j * 180, 100])
            move_cell_to(message_cells[i + j * 4], [0, 0])
        }

        for (let j = 0; j < 4; j++) {
            for (let tmp = 0; tmp < 4; tmp++) {
                move_cell_to(message_cells[i + tmp * 4], [0, 60 * j])
            }

            result = 0
            for (let tmp = 0; tmp < 4; tmp++) {
                result ^= multiply_gf2_8(mix_columns_constant[j][tmp], parseInt(message_cells[i + tmp * 4].innerHTML, 16))
            }

            cell = create_cell(hex(result), "message", j, i)
            hide_cell(cell)
            render_message.appendChild(cell)
            move_cell_to(cell, [1220, 100 + j * 60], true)
            show_cell(cell)
            await sleep(500)
        }
        for (let tmp = 0; tmp < 4; tmp++) {
            move_cell_to(message_cells[i + tmp * 4], [0, 240])
        }
        for (let tmp = 0; tmp < 4; tmp++) {
            hide_cell(message_cells[i + tmp * 4])
        }
        await sleep(300)

        for (let tmp = 0; tmp < 4; tmp++) {
            document.body.removeChild(message_cells[i + tmp * 4])
        }

        for (let tmp = 0; tmp < 4; tmp++) {
            move_cell_to(document.getElementById(`message-${tmp}-${i}`), [0, 0])
        }
    }

    get_constant_cells().forEach((el) => {
        hide_cell(el)
    })
    get_operations().forEach((el) => {
        hide_operation(el)
    })
    await sleep(500)
    get_constant_cells().forEach((el) => {
        document.body.removeChild(el)
    })
    get_operations().forEach((el) => {
        document.body.removeChild(el)
    })
}

rcon = [
    0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
]

sub_byte_table = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]

function sbox(number) {
    return sub_byte_table[number]
}

async function key_expansion(r) {
    key_cells = get_key_cells()

    tmp = [sbox(parseInt(key_cells[7].innerHTML, 16)) ^ rcon[r], sbox(parseInt(key_cells[11].innerHTML, 16)), sbox(parseInt(key_cells[15].innerHTML, 16)), sbox(key_cells[parseInt(key_cells[3].innerHTML, 16)])]

    for (let j = 0; j < 4; j++) {
        hide_cell(key_cells[j * 4])
    }
    await sleep(300)

    for (let j = 0; j < 4; j++) {
        key_cells[j * 4].innerHTML = hex(tmp[j] ^ parseInt(key_cells[3 + j * 4].innerHTML, 16))
    }

    for (let j = 0; j < 4; j++) {
        show_cell(key_cells[j * 4])
    }
    // -----

    tmp = [sbox(key_cells[parseInt(key_cells[0].innerHTML, 16)]), sbox(parseInt(key_cells[4].innerHTML, 16)), sbox(parseInt(key_cells[8].innerHTML, 16)), sbox(parseInt(key_cells[12].innerHTML, 16))]

    for (let j = 0; j < 4; j++) {
        hide_cell(key_cells[j * 4 + 1])
    }
    await sleep(300)

    for (let j = 0; j < 4; j++) {
        key_cells[j * 4 + 1].innerHTML = hex(tmp[j] ^ parseInt(key_cells[j * 4 + 1].innerHTML, 16))
    }

    for (let j = 0; j < 4; j++) {
        show_cell(key_cells[j * 4 + 1])
    }
    // -----

    tmp = [sbox(key_cells[parseInt(key_cells[1].innerHTML, 16)]), sbox(parseInt(key_cells[5].innerHTML, 16)), sbox(parseInt(key_cells[9].innerHTML, 16)), sbox(parseInt(key_cells[13].innerHTML, 16))]

    for (let j = 0; j < 4; j++) {
        hide_cell(key_cells[j * 4 + 2])
    }
    await sleep(300)

    for (let j = 0; j < 4; j++) {
        key_cells[j * 4 + 2].innerHTML = hex(tmp[j] ^ parseInt(key_cells[j * 4 + 2].innerHTML, 16))
    }

    for (let j = 0; j < 4; j++) {
        show_cell(key_cells[j * 4 + 2])
    }
    // -----

    tmp = [sbox(key_cells[parseInt(key_cells[2].innerHTML, 16)]), sbox(parseInt(key_cells[5].innerHTML, 16)), sbox(parseInt(key_cells[9].innerHTML, 16)), sbox(parseInt(key_cells[13].innerHTML, 16))]

    for (let j = 0; j < 4; j++) {
        hide_cell(key_cells[j * 4 + 3])
    }
    await sleep(300)

    for (let j = 0; j < 4; j++) {
        key_cells[j * 4 + 3].innerHTML = hex(tmp[j] ^ parseInt(key_cells[j * 4 + 3].innerHTML, 16))
    }

    for (let j = 0; j < 4; j++) {
        show_cell(key_cells[j * 4 + 3])
    }
}

async function main() {
    start = new Date().getTime()
    await add_round_key()
    for (let round = 1; round <= 10; round++) {
        await key_expansion(round - 1)
        change_round_text(`Раунд №${round} Операция SubByte (инвертирование чисел)`)
        await sub_byte_invert()
        change_round_text(`Раунд №${round} Операция SubByte (матричное умножение)`)
        await sub_byte_apply()
        change_round_text(`Раунд №${round} Операция ShiftRows`)
        await shift_rows()
        change_round_text(`Раунд №${round} Операция MixColumns`)
        await mix_columns()
        change_round_text(`Раунд №${round} Операция AddRoundKey`)
        await add_round_key()
    }
    change_round_text(`Постобработка Операция SubByte (инвертирование чисел)`)
    await sub_byte_invert()
    change_round_text(`Постобработка Операция SubByte (матричное умножение)`)
    await sub_byte_apply()
    change_round_text(`Постобработка Операция ShiftRows`)
    await shift_rows()
    change_round_text(`Постобработка Операция AddRoundKey`)
    await add_round_key()
    running = ((new Date().getTime()) - start) / 1000
    change_round_text(`Готово! Программа выполнялась ${running} секунд`)
}

setTimeout(main, 1000)