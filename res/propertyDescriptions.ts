import {PhysicsPropertyType} from './types';

export const propertyDescriptions = new Map<PhysicsPropertyType, string>();
propertyDescriptions.set(
    PhysicsPropertyType.ObjectPosition,
    `
    <h1>
        Posição
    </h1>
    <p>
        Em física, a posição de um corpo é a especificação de seu lugar no espaço. A identificação da posição é feita a partir de um vetor, denominado vetor posição, que pode ser escrito em função de um sistema de coordenadas de um certo referencial. A unidade de medida da posição no Sistema Internacional de Unidades é o metro.
    </p>
    `
)