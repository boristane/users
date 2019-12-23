FROM node:11
RUN apt update && apt install openssh-client

WORKDIR /var/users
COPY package*.json /var/users/
RUN npm i

COPY . /var/users

CMD bash -c "/var/users/run.sh"