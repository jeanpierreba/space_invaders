const canvas = document.querySelector('canvas')
const scoreElement = document.getElementById('scoreElement')
const lifes = document.getElementById('lifes')
const NumLifes = document.getElementById('NumLifes')
const c = canvas.getContext('2d')

document.getElementById("displayed").style.display = "none";
canvas.width = 1024;
canvas.height = 576;
let timer = 0
let game = {
	pause: false,
	over: false,
	active: true
}
let img2 = true
let isStarted = false
let is2Player = false
let soundEnabled = true
let deathSoundEnabled = true

class Player {
	constructor() {
		this.velocity = {
			x: 0,
			y: 0
		}

		this.opacity = 1

		const image = new Image()
		image.src = './images/player.png'

		image.onload = () => {
			this.image = image
			this.width = image.width * 0.08
			this.height = image.height * 0.08
			this.position = {
				x: canvas.width / 2 - this.width / 2,
				y: canvas.height - this.height - 25
			}
			this.shootSound = new Audio("sounds/shoot.wav")
			this.shootSound.volume = 0.4
			this.opacity = 1
		}
	}
	draw() {
		c.save()
		c.globalAlpha = this.opacity
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
		c.restore()
	}
	update() {
		if (this.image) {
			this.draw()
			this.position.x += this.velocity.x
		}
	}
	makesound() {
		if (soundEnabled) {
			this.shootSound.currentTime = 0
			this.shootSound.play()
		}
	}
}

class Player2 {
	constructor() {
		this.velocity = {
			x: 0,
			y: 0
		}

		this.opacity = 0

		const image = new Image()
		image.src = './images/player2.png'

		image.onload = () => {
			this.image = image
			this.width = image.width * 0.08
			this.height = image.height * 0.08
			this.position = {
				x: canvas.width / 2 + this.width / 2,
				y: canvas.height - this.height - 25
			}
			this.shootSound = new Audio("sounds/shoot.wav")
			this.shootSound.volume = 0.4
			this.opacity = 1
		}
	}
	draw() {
		c.save()
		c.globalAlpha = this.opacity
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
		c.restore()
	}
	update() {
		if (this.image) {
			this.draw()
			this.position.x += this.velocity.x
		}
	}
	makesound() {
		if (soundEnabled) {
			this.shootSound.currentTime = 0
			this.shootSound.play()
		}
	}
}

class Projectile {
	constructor({ position, velocity }) {
		this.position = position
		this.velocity = velocity
		this.radius = 3
	}
	draw() {
		c.beginPath()
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		c.fillStyle = 'white'
		c.fill()
		c.closePath()
	}
	update() {
		this.draw()
		this.position.y += this.velocity.y
		this.position.x += this.velocity.x
	}
}

class Projectile2 {
	constructor({ position, velocity }) {
		this.position = position
		this.velocity = velocity
		this.radius = 3
	}
	draw() {
		c.beginPath()
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		c.fillStyle = 'aquamarine'
		c.fill()
		c.closePath()
	}
	update() {
		this.draw()
		this.position.y += this.velocity.y
		this.position.x += this.velocity.x
	}
}

class InvaderProjectile {
	constructor({ position, velocity }) {
		this.position = position
		this.velocity = velocity
		this.width = 5
		this.height = 8
	}
	draw() {
		c.fillStyle = 'red'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
	update() {
		this.draw()
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
	}
}

class Particle {
	constructor({ position, velocity, radius, color, fades }) {
		this.position = position
		this.velocity = velocity

		this.radius = radius
		this.color = color
		this.opacity = 1
		this.fades = fades
	}
	draw() {
		c.save()
		c.globalAlpha = this.opacity
		c.beginPath()
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		c.fillStyle = this.color
		c.fill()
		c.closePath()
		c.restore()
	}
	update() {
		this.draw()
		this.position.y += this.velocity.y
		this.position.x += this.velocity.x
		if (this.fades) this.opacity -= 0.015
	}
}

class Invader {
	constructor({ position }) {
		this.velocity = {
			x: 0,
			y: 0
		}
		this.deathSound = new Audio("sounds/enemy-death.wav")
		this.deathSound.volume = 0.4
		const image = new Image()
		if (img2) {
			image.src = './images/space_invader_2.png'
		} else {
			image.src = './images/space_invader_1.png'
		}
		image.onload = () => {
			this.image = image
			if (!img2) {
				this.width = 45
				this.height = 40
			} else if (img2) {
				this.width = image.width * 0.8
				this.height = image.height * 0.8
			}
			this.position = {
				x: position.x,
				y: position.y
			}

		}
	}

	draw() {
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
	}
	update({ velocity }) {
		if (this.image) {
			this.draw()
			this.position.x += velocity.x
			this.position.y += velocity.y
		}
	}
	shoot(invaderProjectiles) {
		if (this.image) {
			invaderProjectiles.push(
				new InvaderProjectile({
					position: {
						x: this.position.x + this.width / 2,
						y: this.position.y + this.height
					},
					velocity: {
						x: 0,
						y: 4
					}
				})
			)
		}
	}
	makesound() {
		if (deathSoundEnabled) {
			this.deathSound.currentTime = 0
			this.deathSound.play()
		}
	}
}

class Grid {
	constructor() {
		this.position = {
			x: 0,
			y: 0
		}
		this.velocity = {
			x: 1.25,
			y: 0
		}
		this.invaders = []
		this.width = 11 * 53.5
		if (is2Player) {
			for (let x = 0; x < 12; x++) {
				for (let y = 0; y < 5; y++) {
					if (y < 2) {
						img2 = true
					} else {
						img2 = false
					}
					this.invaders.push(new Invader({
						position: {
							x: x * 58,
							y: y * 65
						}
					}))
				}
			}
		} else {
			for (let x = 0; x < 10; x++) {
				for (let y = 0; y < 4; y++) {
					if (y < 2) {
						img2 = true
					} else {
						img2 = false
					}
					this.invaders.push(new Invader({
						position: {
							x: x * 58,
							y: y * 65
						}
					}))
				}
			}
		}
	}
	update() {
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
		this.velocity.y = 0

		if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
			this.velocity.x = -this.velocity.x
			this.velocity.y = 25
		}
		if (timer % 800 == 0) {
			if (this.velocity.x < 0) {
				this.velocity.x -= 0.75
			} else {
				this.velocity.x += 0.75
			}
			timer = 0
		}
	}
}

const player2 = new Player2()
const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []

const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	space: {
		pressed: false
	}
}

const player2keys = {
	left: {
		pressed: false
	},
	right: {
		pressed: false
	},
	shoot: {
		pressed: false
	}
}

let counter = 0
let frame = 0
let score = 0
let score2 = 0
let timetillnextbullet = 50
let timetillnextbullet2 = 50

for (let i = 0; i < 100; i++) {
	particles.push(new Particle({
		position: {
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height
		},
		velocity: {
			x: 0,
			y: 0.4
		},
		radius: Math.random() * 3,
		color: 'white'
	}))
}

function CreateParticles({ object, color, fades }) {
	for (let i = 0; i < 15; i++) {
		particles.push(new Particle({
			position: {
				x: object.position.x + object.width / 2,
				y: object.position.y + object.height / 2
			},
			velocity: {
				x: (Math.random() - 0.5) * 2,
				y: (Math.random() - 0.5) * 2
			},
			radius: Math.random() * 3,
			color: color || 'red',
			fades: fades
		}))
	}
}

function CreateParticles2({ object, color, fades }) {
	for (let i = 0; i < 15; i++) {
		particles.push(new Particle({
			position: {
				x: object.position.x + object.width / 2,
				y: object.position.y + object.height / 2
			},
			velocity: {
				x: (Math.random() - 0.5) * 2,
				y: (Math.random() - 0.5) * 2
			},
			radius: Math.random() * 3,
			color: color || 'red',
			fades: fades
		}))
	}
}

function animation() {
	id = requestAnimationFrame(animation)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height)
	if (game.pause == true && isStarted == true) {
		c.fillStyle = 'white'
		c.font = '70px Courier New'
		c.fillText('Pause', canvas.width / 2 - 130, canvas.height / 2)
		return
	}
	player.update()
	if (is2Player) {
		player2.update()
	}
	particles.forEach((particle, i) => {
		if (particle.position.y - particle.radius >= canvas.height) {
			particle.position.x = Math.random() * canvas.width
			particle.position.y = -particle.radius
		}
		if (particle.opacity <= 0) {
			setTimeout(() => {
				particles.splice(i, 1)
			}, 0)
		} else {
			particle.update()
		}
	})
	if (!game.active || score < 0) {
		c.fillStyle = 'white'
		c.font = '70px Courier New'
		c.fillText('GAME OVER', canvas.width / 2 - 210, canvas.height / 2)
		player.velocity.x = 0
		player2.velocity.x = 0
		return
	}
	invaderProjectiles.forEach((invaderProjectile, ipIndex) => {
		if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
			setTimeout(() => {
				invaderProjectiles.splice(ipIndex, 1)
			}, 0)
		} else {
			invaderProjectile.update()
		}
		if (invaderProjectile.position.y + invaderProjectile.height >= player2.position.y &&
			invaderProjectile.position.x + invaderProjectile.width >= player2.position.x &&
			invaderProjectile.position.x <= player2.position.x + player2.width && is2Player) {
			setTimeout(() => {
				invaderProjectiles.splice(ipIndex, 1)
				score -= 500
				scoreElement.innerHTML = score
			}, 0)
			CreateParticles2({
				object: player2,
				color: 'aquamarine',
				fades: true
			})
		} else if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
			invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
			invaderProjectile.position.x <= player.position.x + player.width && is2Player) {
			setTimeout(() => {
				invaderProjectiles.splice(ipIndex, 1)
				score -= 500
				scoreElement.innerHTML = score
			}, 0)
			CreateParticles({
				object: player,
				color: 'white',
				fades: true
			})
		}
		if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
			invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
			invaderProjectile.position.x <= player.position.x + player.width && !is2Player) {
			setTimeout(() => {
				invaderProjectiles.splice(ipIndex, 1)
				player.opacity = 0
				game.over = true
			}, 0)
			setTimeout(() => {
				game.active = false
			}, 300)
			CreateParticles({
				object: player,
				color: 'white',
				fades: true
			})
		}
	})
	projectiles.forEach((projectile, index) => {
		if (projectile.position.y + projectile.radius <= 0) {
			setTimeout(() => {
				projectiles.splice(index, 1)
			}, 0)
		} else {
			projectile.update()
		}
	})
	grids.forEach((grid, gIndex) => {
		grid.update()
		if (frame % 40 == 0 && grid.invaders.length > 0 && is2Player) {
			grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
			frame = 0
		}
		else if (frame % 70 == 0 && grid.invaders.length > 0) {
			grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
			frame = 0
		}
		grid.invaders.forEach((invader, iIndex) => {
			invader.update({ velocity: grid.velocity })
			projectiles.forEach((projectile, pIndex) => {
				if (grid.position.y + grid.height >= canvas.height) {
					grid.invaders.splice(iIndex, 1)
					grids.push(new Grid())
				}
				if (projectile.position.y - projectile.radius <= invader.position.y + invader.height
					&& projectile.position.x + projectile.radius >= invader.position.x &&
					projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
					projectile.position.y + projectile.radius >= invader.position.y) {
					setTimeout(() => {
						const invaderFound = grid.invaders.find(invader2 => {
							return invader2 === invader
						})
						const projectileFound = projectiles.find(projectile2 => {
							return projectile2 === projectile
						})
						if (invaderFound && projectileFound && isStarted) {
							score += 100
							scoreElement.innerHTML = score
							CreateParticles({
								object: invader,
								fades: true
							})
							invader.makesound()
							grid.invaders.splice(iIndex, 1)
							projectiles.splice(pIndex, 1)
							if (grid.invaders.length > 0) {
								const firstInvader = grid.invaders[0]
								const lastInvader = grid.invaders[grid.invaders.length - 1]
								grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
								grid.position.x = firstInvader.position.x
							} else {
								grids.splice(0, 1)
								counter = 0
							}
						}
					}, 0)
				}
			})
		})
	})
	if (keys.a.pressed && player.position.x >= 10) {
		player.velocity.x = -3.7
	} else if (keys.d.pressed && player.position.x + player.width <= canvas.width - 10) {
		player.velocity.x = 3.7
	} else {
		player.velocity.x = 0
	}
	if (counter % 4000 == 0) {
		grids.push(new Grid())
		counter = 0
	}
	if (player2keys.left.pressed && player2.position.x >= 10) {
		player2.velocity.x = -3.7
	} else if (player2keys.right.pressed && player2.position.x + player2.width <= canvas.width - 10) {
		player2.velocity.x = 3.7
	} else {
		player2.velocity.x = 0
	}
	frame++
	counter++
	timetillnextbullet++
	timetillnextbullet2++
	timer++
	addEventListener('keydown', ({ key }) => {
		if (game.pause) return
		switch (key) {
			case 'r':
				cancelAnimationFrame(id)
				c.fillStyle = 'black'
				c.fillRect(0, 0, canvas.width, canvas.height)
				grids.splice(0, 1)
				projectiles.splice(0, 1)
				console.log(grids)
				console.log(projectiles)
				isStarted = false
				timer = 0
				score = 0
				scoreElement.innerHTML = score
				document.getElementById("displayed").style.display = "none";
				menu()
		}
	})
}

function menu() {
	c.fillStyle = 'white'
	c.font = '50px Courier New'
	c.fillText('Multi Space Invaders', canvas.width / 2 - 330, canvas.height / 2 - 150)
	c.font = '30px Courier New'
	c.fillText('Press 1 to play arcade mode', canvas.width / 2 - 280, canvas.height / 2)
	c.fillText('Press 2 to play co-op', canvas.width / 2 - 240, canvas.height / 2 + 50)
	addEventListener('keydown', ({ key }) => {
		if (isStarted) return
		switch (key) {
			case '1':
				isStarted = true
				is2Player = false
				game.over = false
				game.active = true
				counter = 0
				player.velocity.x = 0
				player.velocity.y = 0
				player.opacity = 1
				projectiles.splice(0, 5)
				keys.a.pressed = false
				keys.d.pressed = false
				document.getElementById("displayed").style.display = "flex";
				animation()
				break
			case '2':
				isStarted = true
				is2Player = true
				game.over = false
				game.active = true
				player.opacity = 1
				player2.opacity = 1
				counter = 0
				player.velocity.x = 0
				player.velocity.y = 0
				keys.a.pressed = false
				keys.d.pressed = false
				player2keys.left.pressed = false
				player2keys.right.pressed = false
				document.getElementById("displayed").style.display = "flex";
				animation()
				break
		}
	})
}

menu()

addEventListener('keydown', ({ key }) => {
	pause_sound = new Audio('sounds/game-pause.mp3')
	pause_sound.volume = 0.4
	if (game.over) return
	switch (key) {
		case 'a':
			keys.a.pressed = true
			break
		case 'd':
			keys.d.pressed = true
			break
		case 'Escape':
			if (!game.over) {
				if (game.pause == false) {
					game.pause = true
					pause_sound.currentTime = 0
					pause_sound.play()
					break
				}
				if (game.pause == true) {
					game.pause = false
					break
				}
			}
			if (is2Player == false) return
		case 'ArrowLeft':
			player2keys.left.pressed = true
			break
		case 'ArrowRight':
			player2keys.right.pressed = true
			break
	}
})

addEventListener('keyup', ({ key }) => {
	if (game.over) return
	switch (key) {
		case 'a':
			keys.a.pressed = false
			break
		case 'd':
			keys.d.pressed = false
			break
		case ' ':
			soundEnabled = true
			if (timetillnextbullet >= 50) {
				player.makesound()
				projectiles.push(new Projectile({
					position: {
						x: player.position.x + player.width / 2,
						y: player.position.y,
					},
					velocity: {
						x: 0,
						y: -7,
					}
				}))
				timetillnextbullet = 0
			}
			break
	}
})

addEventListener('keyup', ({ key }) => {
	if (game.over) return
	if (!is2Player) return
	switch (key) {
		case 'ArrowLeft':
			player2keys.left.pressed = false
			break
		case 'ArrowRight':
			player2keys.right.pressed = false
			break
		case 'ArrowUp':
			if (timetillnextbullet2 >= 50) {
				player2.makesound()
				projectiles.push(new Projectile2({
					position: {
						x: player2.position.x + player2.width / 2,
						y: player2.position.y,
					},
					velocity: {
						x: 0,
						y: -7,
					}
				}))
				timetillnextbullet2 = 0
			}
			break
	}
}) 
