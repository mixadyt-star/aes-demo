render_message = document.getElementById("render_message")
render_key = document.getElementById("render_key")

document.getElementById("speed-form").reset()

for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
        render_message.appendChild(create_cell(hex(message[i][j]), "message", i, j))
    }
}

for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
        render_key.appendChild(create_cell(hex(key[i][j]), "key", i, j))
    }
}