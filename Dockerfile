
### Alpine Ettercap Builder Image ###
FROM alpine:3.6 as builder

# Download the pre-requisites for ettercap to build.
RUN apk -U --no-cache add   \
        wget                \
        cmake               \
        flex                \
        bison               \
        build-base          \
        openssl-dev         \
        curl-dev            \
        libpcap-dev         \
        libnet-dev          \
        libidn-dev          \
        linux-headers       \
        ca-certificates

# Download Ettercap 0.8.2 and unpack the source files.
RUN wget https://github.com/Ettercap/ettercap/archive/v0.8.2.tar.gz
RUN tar xzf v0.8.2.tar.gz
RUN mkdir /ettercap-0.8.2/build

# We want to build ettercap without GTK or Curses support.  We also
# want to make sure that we set the install path to something that
# we can easily pull from.
WORKDIR /ettercap-0.8.2/build
RUN cmake                               \
        -D ENABLE_GTK=OFF               \
        -D ENABLE_CURSES=OFF            \
        -D INSTALL_DESKTOP=OFF          \
        ..
RUN make
RUN make install


### Dofler Ettercap Image ###
FROM node:9.1-alpine
ENV PCAP ""
ENV MONITOR_INTERFACE "eth0"
ENV DOFLER_ADDRESS ""

# Install the prerequisites needed for ettercap to run and then copy
# over the compiled application.
RUN apk -U --no-cache add   \
        curl                \
        libpcap             \
        libnet              \
        openssl             \
        libidn
COPY --from=builder /usr/local /usr/local
COPY --from=builder /etc/ettercap /etc/ettercap

# Now lets pull in the parser code and install the dependencies.
COPY app /opt/app
WORKDIR /opt/app 
RUN npm install .

CMD ["node", "/opt/app/index.js"]