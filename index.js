let net = require('net')
const readline = require('readline')
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

const CRLF = '\r\n'
const b = '> '

let stream
let login = false
console.log('> input host port')
rl.on('line', (input) => {
	input = input.trim()
	if(input!==''){
		let arr = input.split(' ')
		if(!login && arr.length==2){
			createClient(arr[0], arr[1])
		}
		if(login && arr.length==1 && arr[0] == 'quit'){
			stream.write('*1' + CRLF + '$4' + CRLF + 'quit' + CRLF)
		}else if(login){
			main(arr)
		}
	}else{
		outErr('input error')
	}
})

function main(arr){
	let r = '*' + arr.length + CRLF
	arr.forEach( item => {
		r += '$' + item.length + CRLF + item + CRLF
	})
	stream.write(r)
}

function outErr(params){
	console.log(b + 'ERROR: ' + params)
}

function filter(s){
	if(s[0] == '+' || s[0] == '-'){
		s = s.substr(1)
		s = s.split(CRLF).join('')
		console.log(b + s)
	}else if(s[0] == '-'){
		s = s.substr(1)
		s = s.split(CRLF).join('')
		console.log(b + 'Error: ' + s)
	}else if(s[0] == '$'){
		s = s.substr(1)
		arr = s.split(CRLF)
		arr.splice(-1)
		arr.splice(0,1)
		s = arr.join('\n')
		console.log(b + s)
	}else if(s[0] == '*'){
		s = s.substr(1)
		arr = s.split(CRLF)
		arr.splice(0,1)
		let result = []
		arr.forEach( (item, index) => {
			if(index%2 == 1){
				result.push(item)
			}
		})

		console.log(b + result)
	}else{
		s = s.substr(1)
		s = s.split(CRLF).join('')
		console.log(b + s)
	}
}

function createClient(host, port){
	let options = {}
	options.port = port
	options.host = host
	stream = net.createConnection(options)
	stream.on('data', s => {
		filter(s)
	})
	stream.on('error', (err)=>{
		console.log(b + 'error: ' + err)
	})
	stream.on('connect', () => {
		console.log(b + 'connect')
		stream.setNoDelay()
		stream.setTimeout(0)
		stream.setEncoding('utf8')

		login = true
	})
	stream.on('end', () => {
		console.log(b + 'end')
	})
	stream.on('close', () => {
		console.log(b + 'disconnected')
	})
}