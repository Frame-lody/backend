FROM --platform=linux/amd64 python:3.11.9-slim

# Upgrade pip
RUN python -m pip install --upgrade pip

# 下載requirements.txt
COPY requirements.txt /tmp/pip-tmp/
RUN pip3 --default-time=100 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
&& rm -rf /tmp/pip-tmp

# 安裝一些需要的東東
RUN apt update && \
    apt install -y gcc ffmpeg && \
    apt install -y git && \
    apt install -y redis-tools && \
    pip install torch==2.3.0 torchvision==0.18.0 torchaudio==2.3.0 --index-url https://download.pytorch.org/whl/cpu && \
    pip install natten==0.17.1+torch230cpu -f https://shi-labs.com/natten/wheels && \
    pip install git+https://github.com/CPJKU/madmom && \
    pip install allin1
