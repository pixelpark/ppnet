FROM nginx

WORKDIR /tmp

RUN apt-get -y update && \
    apt-get -y install wget unzip

RUN wget --no-check-certificate https://github.com/pixelpark/ppnet/archive/master.zip && \
    unzip master.zip ppnet-master/www/\* && \
    mv ppnet-master/www/* /usr/share/nginx/html && \
    rm master.zip

EXPOSE 80
