FROM gcc as build

WORKDIR /usr/src

COPY . /usr/src

ARG UNAME_P
ENV UNAME_P ${UNAME_P}

ARG UNAME_M
ENV UNAME_M ${UNAME_M}

RUN make UNAME_M=${UNAME_M} UNAME_P=${UNAME_P}

FROM gcc

LABEL org.opencontainers.image.authors="kayvan.sylvan@gmail.com"

COPY --from=build /usr/src/chat /usr/src/quantize /usr/local/bin

ENTRYPOINT [ "/usr/local/bin/chat" ]
