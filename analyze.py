import allin1

result = allin1.analyze('stay.mp3')
print(result)

with open('result.txt', 'w') as f:
    f.write(str(result))