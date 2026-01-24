#!/bin/bash

kubectl delete configmap email-scheduler-config

kubectl delete svc email-scheduler

kubectl delete svc redis

kubectl delete deployment email-scheduler-app

kubectl delete deployment redis

kubectl delete pvc redis-data








