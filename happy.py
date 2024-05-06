from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D
import matplotlib.pyplot as plt

audio = MonoLoader(filename="5.wav", sampleRate=48000, resampleQuality=4)()
embedding_model = TensorflowPredictMusiCNN(graphFilename="msd-musicnn-1.pb", output="model/dense/BiasAdd")
embeddings = embedding_model(audio)

model = TensorflowPredict2D(graphFilename="deam-msd-musicnn-2.pb", output="model/Identity")
predictions = model(embeddings)

print(predictions)

# plt.matshow(predictions.T)
# plt.title('Predictions')