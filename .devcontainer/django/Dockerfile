# FROM --platform=linux/amd64 python:3.11.9-slim

# # Upgrade pip
# RUN python -m pip install --upgrade pip

# 下載requirements.txt
# COPY requirements.txt /tmp/pip-tmp/
# RUN pip3 --default-time=100 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
# && rm -rf /tmp/pip-tmp

# # 安裝一些需要的東東
# RUN apt update && \
#     apt install -y gcc ffmpeg && \
#     apt install -y git && \
#     apt install -y redis-tools && \
#     pip install torch==2.3.0 torchvision==0.18.0 torchaudio==2.3.0 --index-url https://download.pytorch.org/whl/cpu && \
#     pip install natten==0.17.1+torch230cpu -f https://shi-labs.com/natten/wheels && \
#     pip install git+https://github.com/CPJKU/madmom && \
#     pip install allin1

FROM nvidia/cuda:12.3.2-cudnn9-runtime-ubuntu22.04



# 安裝常用工具
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    sudo \
    git \
    ffmpeg

# 設定時區
RUN DEBIAN_FRONTEND=noninteractive TZ=Asia/Taipei apt-get -y install tzdata

# 安裝python3.11
RUN sudo apt install -y software-properties-common && \
    sudo add-apt-repository -y ppa:deadsnakes/ppa && \
    sudo apt install -y python3.11 && \
    sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1  && \
    sudo apt install -y python3-pip \
    redis-tools

# 安裝pytorch
RUN pip3 install --no-cache-dir torch==2.4.1 torchvision==0.19.1 torchaudio==2.4.1 --index-url https://download.pytorch.org/whl/cu124 && \
    pip3 install --no-cache-dir natten==0.17.1+torch240cu124 -f https://shi-labs.com/natten/wheels/ && \
    pip3 install --no-cache-dir git+https://github.com/CPJKU/madmom && \
    pip3 install --no-cache-dir allin1

# 安裝pip套件
COPY requirements.txt /tmp/pip-tmp/
RUN pip3 --default-time=100 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
&& rm -rf /tmp/pip-tmp

# 清除多餘檔案，減少映像大小
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
