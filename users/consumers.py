from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer


CONN_LIST = [] #本次展示群發功能，不採用lays用法，所以需要裝載所有連接的客戶資訊
class ChatConsumer(WebsocketConsumer):

    def websocket_connect(self, message):
        #有客戶端來向後端發送ws自動觸發
        print('有人來連接')
        self.accept() #後端允許連結
        CONN_LIST.append(self)

    def websocket_receive(self, message):
        #瀏覽器基於ws傳送資料，自動觸發接受消息(message)
        print('接收瀏覽器的訊息-->', message['text'])
        text = message['text']
        res ="{}".format(text)
        for conn in CONN_LIST:
            conn.send(res)

        if text == 'close':
            self.send('你要求我關閉喔！')
            self.close() #後端自動斷開
            #raise StopConsumer()  # 後端不允許連結，就不會執行websocket_disconnect
            return

    def websocket_disconnect(self, message):
        #客戶端離線就觸發
        print('客戶端斷開')
        CONN_LIST.remove()
        raise StopConsumer() #後端不允許連結
