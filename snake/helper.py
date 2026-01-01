import matplotlib.pyplot as plt
from IPython import display

plt.ion()

def plot(scores, mean_scores):
    try:
        display.clear_output(wait=True)
        display.display(plt.gcf())
        plt.clf()
        plt.title('Training...')
        plt.xlabel('Number of Games')
        plt.ylabel('Score')
        plt.plot(scores)
        plt.plot(mean_scores)
        plt.show()
        plt.pause(0.1)
    except KeyboardInterrupt:
        plt.close('all')
        raise
    except Exception as e:
        print(f"Plotting error: {e}")
        pass