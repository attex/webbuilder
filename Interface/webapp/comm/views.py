from django.shortcuts import render, HttpResponse,redirect
from django import forms
from django.template.defaultfilters import slugify
from comm.models import Module, Device
from django import template
from tempfile import mkstemp
from shutil import move
from os import fdopen, remove, path
from ws4py.websocket import WebSocket
from docker import APIClient
from paramiko import SSHClient
from scp import SCPClient
import docker
import uuid
import logging
import re
import sys
import paramiko
import os
import subprocess


def index(request):
	# load all devices
		modules = getAllModules()
		devices =  getDevices()
		components = ['Prometheus','Database']
		args = {'devices': devices, 'components':components,'modules':modules,}
		print "[DEVICES]",devices
		print "[MODULES]",modules

		return render(request, 'index.html',args)

def post(request):
		print request.POST
		file_dir = request.POST.get("inputGroupFile01")
		idd = request.POST.get("inputGroupSelect01")
		name = request.POST.get("inputGroupName01")
		d = Device.objects.get(id=idd)
		startModule(file_dir,idd,d, name)
#		tag = buildDockerFile("/Docker/" + d.platform, d, file_dir) # build file
	#	runDocker(d,tag, file_dir)
		return redirect('/')

def startModule(filep,idd,d, name):
		if(d.platform=="ESP8266"):
			e = ESP8266()
			e.init_module(filep,idd,d, name)
		elif(d.platform=="RaspberryPi3"):
			e = RASPBERRYPI3()
			e.init_module(filep,idd,d, name)
		elif(d.plarform=="XIAOMISDJQR01RR"):
			e = XIAOMISDJQR01RR()
			e.init_module(filep,idd,d,name)

def exec_Module(request, idd):
		print "[EXEC] Module with id: ", idd
		c = Module.objects.get(moduleid=idd)
		d = c.deviceid
		if(d.platform=="ESP8266"):
			e = ESP8266()
			e.run_module(idd)
		elif(d.platform=="RaspberryPi3"):
			e = RASPBERRYPI3()
			e.run_module(idd)
		elif(d.plarform=="XIAOMISDJQR01RR"):
			e = XIAOMISDJQR01RR()
			e.run_module(idd)
		return redirect('/')

def getDevices():
		devs = []
	   	devlist = Device.objects.all()
		for i in devlist:
			devs.append({'id':i.id,'deviceid': i.deviceid ,'platform': i.platform})
   		return devs


def delete_Module(request, idd):
	client = docker.from_env()
	try:
		container = client.containers.get(id)
		container.stop()
		container.delete()
		c = Module.objects.get(moduleid=id)
		im = client.images.get(c.containertag)
		im.delete()
	except:
		print "[DELETE] No container found"
	print "[DELETE] deleting module: ", idd
	print Module.objects.filter(moduleid=idd).delete()
	return redirect('/')

def logContainer(id):
	client = docker.from_env()
	container = client.containers.get(id)
	container.logs()

def getAllModules():
		conts = []
		contlist = Module.objects.all()
		for i in contlist:
			device = i.deviceid # Device.objects.get(id=)
			print "Container: " + i.containerid
			conts.append({'mid': i.moduleid,'name':i.modulename,'file':i.filepath,'id': i.containerid ,'tag':i.containertag,'systemID': device.deviceid,'status':i.status,'platfom':device.platform})
		return conts


def monitor(request, idd):
		print "[MONITORING] Modul: ", idd
		print idd
		c = Module.objects.get(moduleid=idd)
		dev = c.deviceid
		name =  dev.deviceid
		container =  c.containerid
		tag =  c.containertag
		platform =  dev.platform
		client = docker.from_env()
		container = ""
		log = ""
		try:
			container = client.containers.get(c.containerid)
			log = container.logs()
		except:
			print "[ERROR] No container found"
		#contianer = client.containers.containers(filters(id=c.containerid))
		print "[LOGS] ", log
		info = [{'key':"Platform",'value':platform},{'key':"ID",'value':name},{'key':"Container",'value':container},{'key':"Containertag",'value':tag}]
		args = {'name': name, 'infos':info,'log':log}
		return render(request, 'monitor.html',args,idd)

		#image = client.images.build()
		#return image
class ESP8266():
	def init_module(self,npath, id, dev,name):
		print "[INIT_MODULE] ESP8266"
		d = Device.objects.get(id=dev.id)
		client = docker.APIClient() # docker.APIClient()
		module_dir = os.path.dirname(__file__)  # get current directory
		dir_path = module_dir + '/Docker/' + dev.platform
		file_path = os.path.join(dir_path, 'Dockerfile')
		f = open(file_path,'r')
		print file_path
		print f
		imTag = str(uuid.uuid4().int)
		print imTag
		response = [line for line in client.build(path=dir_path,dockerfile=file_path, rm=True, tag=imTag)]    #,buildargs={"FILE":str(filedir)})]  # fileobj=f
		for i in response:
			print i
		print "[SUCCESS] Built docker image."
		try:
			print "[CONTAINER] starting container with tag: ", imTag
			client = docker.from_env()
			im = client.images.get(imTag)
			print "[IMAGES]", im
			#container = client.containers.run(im, detach=True)
			devices = d.path + ":rwm"
			print devices
			vol = {npath: {'bind': '/build', 'mode': 'rw'}}
			print "[CONTAINER] starting: ", im
			devicepath="DEVICEPATH=" + d.path
			container = client.containers.run(im, detach=True,devices=[devices],volumes=vol)
			print container.logs()
			print container
			c = Module(modulename=name,moduleid=imTag,containerid=container.id,filepath=npath,containertag=imTag,deviceid=d,status="running")
			c.save()
		except:
			print "[CONTAINER ERROR] could not run container"
			Module.objects.filter(containertag=imTag).delete()

	def run_module(self,idd):
		print "[STARTING MODULE] ESP8266"
		c = Module.objects.get(moduleid=idd)
		client = docker.from_env()
		print "[CONTAINER] ", c.containertag
		try:
			d = c.deviceid
			im = client.images.get(c.containertag)
			print "[CONTAINER] Trying to run."
			vol = {'/opt/Espressif/esp-open-sdk/examples/blinky/': {'bind': '/build', 'mode': 'rw'}}
			print vol
			print "vol"
			devices = d.path + ":rwm"
			print devices
			devicepath="DEVICEPATH=" + d.path
			container = client.containers.run(im, detach=True,devices=[devices],volumes=vol) # ,devices=d.path,volumes={'/opt': {'bind': '/build', 'mode': 'rw'}}
			print "[RUNNING CONTAINER] Successfully started"
			#container = client.containers.run(im, detach=True,devices=c.filepath)
			print container.logs() # do something with these logs
			#container = client.containers.run(im, detach=True)
			c.status = "running"
		except:
			c.status = "stopped"
			print "[CONTAINER:ERROR] Could not start"
		c.save()
		return redirect('/')

class RASPBERRYPI3():
	def init_module(self,npath, id, dev,name):
		try:
			print "[SCP Connecting] With: ", dev.path
			ssh = SSHClient()
			ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
			ssh.connect(dev.path, username='root', password='rasp')
			print "[SSH Connected] successful"
			scp = SCPClient(ssh.get_transport())
			print "[SCP Connected] successful"
			imTag = str(uuid.uuid4().int)
			id = imTag[:4]
			ssh.exec_command('mkdir Docker' + id)
			print "[SCP CLIENT] Directory created"
			scp.put(npath + 'run.sh','Docker' + id + '/run.sh')
			scp.put(npath + 'Dockerfile','Docker' + id + '/Dockerfile')
			print "[SCP CLIENT] Copied files"
			docker_build ='docker build -t ' + imTag + ' --build-arg FILEPATH=Docker' + id + ' Docker' + id
			print docker_build
			ssh.exec_command(docker_build)
			print "[SCP CLIENT] Docker built"
			ssh.exec_command('docker run --privileged ' + imTag)
			logging.getLogger("paramiko").setLevel(logging.WARNING)
			print "[SCP CLIENT] Docker run"
			c = Module(modulename=name,moduleid=imTag,containerid="empty",filepath=npath,containertag=imTag,deviceid=dev,status="running")
			c.save()

		except:
			print "[SCP CLIENT] Could not start docker container"
			#Module.objects.filter(containertag=tag).delete()
		#container = client.containers.run(image=image, detach=True)

	def run_module(self,idd):
		c = Module.objects.get(moduleid=idd)
		dev = c.deviceid
		try:
			logger = logging.getLogger('spam_application')
			logger.setLevel(logging.DEBUG)
			fh = logging.FileHandler('spam.log')
			fh.setLevel(logging.DEBUG)
			# create console handler with a higher log level
			ch = logging.StreamHandler()
			ch.setLevel(logging.ERROR)
			# create formatter and add it to the handlers
			formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
			fh.setFormatter(formatter)
			ch.setFormatter(formatter)
			# add the handlers to the logger
			logger.addHandler(fh)
			logger.addHandler(ch)
			logger.info("Lol")
			print "[SCP Connecting] With: ", dev.path
			ssh = SSHClient()
			ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
			ssh.connect(dev.path, username='root', password='rasp')
			print "[SSH Connected] successful"
			docker_run ='docker run --privileged ' + c.containertag
			print docker_run
			ssh.exec_command(docker_run)
			print "[SCP CLIENT] Docker run"
			c.status = "running"
		except:
			c.status = "stopped"
			print "[SCP CLIENT] Could not start docker container"
		c.save()
		return ("/")


class XIAOMISDJQR01RR():
	def init_module(self,npath, id, dev,name):
		try:
			print "[SCP Connecting] With: ", dev.path
			ssh = SSHClient()
			ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
			ssh.connect(dev.path, username='root', password='rasp')
			print "[SSH Connected] successful"
			scp = SCPClient(ssh.get_transport())
			print "[SCP Connected] successful"
			imTag = str(uuid.uuid4().int)
			ssh.exec_command('mkdir Docker' + id)
			print "[SCP CLIENT] Directory created"
			scp.put(npath + 'run.sh','Docker' + id + '/run.sh')
			scp.put(npath + 'Dockerfile','Docker' + id + '/Dockerfile')
			print "[SCP CLIENT] Copied files"
			docker_build ='docker build -t ' + imTag + ' --build-arg FILEPATH=Docker' + id + ' Docker' + id
			print docker_build
			ssh.exec_command(docker_build)
			print "[SCP CLIENT] Docker built"
			ssh.exec_command('docker run --privileged ' + imTag)
			logging.getLogger("paramiko").setLevel(logging.WARNING)
			print "[SCP CLIENT] Docker run"
			c = Module(modulename=name,moduleid=imTag,containerid="empty",filepath=npath,containertag=imTag,deviceid=dev,status="running")
			c.save()

		except:
			print "[SCP CLIENT] Could not start docker container"
			#Module.objects.filter(containertag=tag).delete()
		#container = client.containers.run(image=image, detach=True)

	def run_module(self,idd):
		c = Module.objects.get(moduleid=idd)
		dev = c.deviceid
		try:
			logger = logging.getLogger('spam_application')
			logger.setLevel(logging.DEBUG)
			fh = logging.FileHandler('spam.log')
			fh.setLevel(logging.DEBUG)
			# create console handler with a higher log level
			ch = logging.StreamHandler()
			ch.setLevel(logging.ERROR)
			# create formatter and add it to the handlers
			formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
			fh.setFormatter(formatter)
			ch.setFormatter(formatter)
			# add the handlers to the logger
			logger.addHandler(fh)
			logger.addHandler(ch)
			logger.info("Lol")
			print "[SCP Connecting] With: ", dev.path
			ssh = SSHClient()
			ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
			ssh.connect(dev.path, username='root', password='rasp')
			print "[SSH Connected] successful"
			docker_run ='docker run --privileged ' + c.containertag
			print docker_run
			ssh.exec_command(docker_run)
			print "[SCP CLIENT] Docker run"
			c.status = "running"
		except:
			c.status = "stopped"
			print "[SCP CLIENT] Could not start docker container"
		c.save()
		return ("/")
#class EchoWebSocket(WebSocket):
#    def received_message(self, message):
#        self.send(message.data, message.is_binary)
